import os
import requests
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwk, jwt, JWTError
from jose.utils import base64url_decode
import json
import time

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
        self.issuer = f"https://login.microsoftonline.com/{self.tenant_id}/v2.0"
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
                return jwk.construct(key).key
        
        raise HTTPException(
            status_code=401,
            detail="Unable to find matching key for token"
        )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode the JWT token"""
        try:
            # Decode header to get key id
            header = jwt.get_unverified_header(token)
            
            # Get signing key
            signing_key = self.get_signing_key(header)
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.client_id,
                issuer=self.issuer,
                options={
                    "verify_signature": True,
                    "verify_aud": True,
                    "verify_iat": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iss": True,
                }
            )
            
            return payload
            
        except JWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Token validation failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=f"Authentication error: {str(e)}"
            )

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