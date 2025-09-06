import os
import requests
import jwt as pyjwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import json
import time
import base64

security = HTTPBearer()

class AzureADAuth:
    def __init__(self):
        self.tenant_id = os.getenv("AZURE_TENANT_ID")
        self.client_id = os.getenv("AZURE_CLIENT_ID")
        self.client_secret = os.getenv("AZURE_CLIENT_SECRET")
        
        if not all([self.tenant_id, self.client_id]):
            raise ValueError("Azure AD configuration missing. Please set AZURE_TENANT_ID and AZURE_CLIENT_ID environment variables.")
        
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self.jwks_uri = f"{self.authority}/discovery/v2.0/keys"
        self.issuer_v2 = f"https://login.microsoftonline.com/{self.tenant_id}/v2.0"
        self.issuer_v1 = f"https://sts.windows.net/{self.tenant_id}/"
        self._jwks_cache = None
        self._jwks_cache_time = 0
        self._cache_duration = 3600  # 1 hour
    
    def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set from Azure AD, with caching"""
        current_time = time.time()
        
        if (self._jwks_cache is None or 
            current_time - self._jwks_cache_time > self._cache_duration):
            try:
                response = requests.get(self.jwks_uri, timeout=10)
                response.raise_for_status()
                self._jwks_cache = response.json()
                self._jwks_cache_time = current_time
            except requests.RequestException as e:
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to fetch Azure AD keys: {str(e)}"
                )
        
        return self._jwks_cache
    
    def get_signing_key(self, token_header: Dict[str, Any]) -> str:
        """Get the signing key for token validation"""
        jwks = self.get_jwks()
        
        kid = token_header.get("kid")
        if not kid:
            raise HTTPException(
                status_code=401,
                detail="Token header missing 'kid' parameter"
            )
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                try:
                    # Convert the key to PEM format for PyJWT
                    n = key.get("n")
                    e = key.get("e")
                    
                    if not n or not e:
                        continue
                    
                    # Decode the base64url encoded values
                    n_bytes = self._base64url_decode(n)
                    e_bytes = self._base64url_decode(e)
                    
                    # Convert to integers
                    n_int = int.from_bytes(n_bytes, byteorder='big')
                    e_int = int.from_bytes(e_bytes, byteorder='big')
                    
                    # Create RSA public key
                    public_numbers = rsa.RSAPublicNumbers(e_int, n_int)
                    public_key = public_numbers.public_key()
                    
                    # Convert to PEM format
                    pem_key = public_key.public_bytes(
                        encoding=serialization.Encoding.PEM,
                        format=serialization.PublicFormat.SubjectPublicKeyInfo
                    )
                    return pem_key.decode('utf-8')
                    
                except Exception as e:
                    print(f"Error constructing key: {e}")
                    continue
        
        raise HTTPException(
            status_code=401,
            detail="Unable to find matching key for token"
        )
    
    def _base64url_decode(self, data: str) -> bytes:
        """Decode base64url encoded data"""
        # Add padding if necessary
        padding = 4 - len(data) % 4
        if padding != 4:
            data += '=' * padding
        
        return base64.urlsafe_b64decode(data)
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Skip token verification for development and return dummy user"""
        print("DEVELOPMENT: Skipping JWT verification and returning dummy user")
        return {
            "sub": "dev-user-123",
            "oid": "dev-user-123", 
            "name": "Development User",
            "email": "dev@example.com",
            "preferred_username": "dev@example.com",
            "tid": "dev-tenant-123",
            "roles": [],
            "groups": []
        }

# Global instance
azure_auth = AzureADAuth()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required"
        )
    
    token = credentials.credentials
    user_info = azure_auth.verify_token(token)
    
    # Extract common user fields
    return {
        "user_id": user_info.get("oid", user_info.get("sub")),
        "email": user_info.get("email", user_info.get("preferred_username")),
        "name": user_info.get("name"),
        "tenant_id": user_info.get("tid"),
        "roles": user_info.get("roles", []),
        "groups": user_info.get("groups", []),
        "raw_claims": user_info
    }

async def get_optional_user(
    request: Request
) -> Optional[Dict[str, Any]]:
    """Optional authentication dependency"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        user_info = azure_auth.verify_token(token)
        
        return {
            "user_id": user_info.get("oid", user_info.get("sub")),
            "email": user_info.get("email", user_info.get("preferred_username")),
            "name": user_info.get("name"),
            "tenant_id": user_info.get("tid"),
            "roles": user_info.get("roles", []),
            "groups": user_info.get("groups", []),
            "raw_claims": user_info
        }
    except:
        return None