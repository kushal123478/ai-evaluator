#!/usr/bin/env python3
"""
Simple test script to verify Azure AD authentication setup
This script tests the auth configuration without requiring a real token
"""

import os
from dotenv import load_dotenv
from auth import AzureADAuth

def test_auth_configuration():
    """Test Azure AD authentication configuration"""
    print("🔐 Testing Azure AD Authentication Configuration")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            print(f"✅ {var}: {value[:8]}..." if len(value) > 8 else f"✅ {var}: {value}")
    
    if missing_vars:
        print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these variables in your .env file")
        return False
    
    try:
        # Initialize Azure AD Auth
        auth = AzureADAuth()
        print(f"✅ Azure AD Auth initialized successfully")
        print(f"   Authority: {auth.authority}")
        print(f"   JWKS URI: {auth.jwks_uri}")
        print(f"   Issuer: {auth.issuer}")
        
        # Test JWKS endpoint access
        print("\n🔑 Testing JWKS endpoint...")
        try:
            jwks = auth.get_jwks()
            if 'keys' in jwks and len(jwks['keys']) > 0:
                print(f"✅ Successfully fetched {len(jwks['keys'])} signing keys")
                print(f"   First key ID: {jwks['keys'][0].get('kid', 'Unknown')}")
            else:
                print("❌ No signing keys found in JWKS response")
                return False
        except Exception as e:
            print(f"❌ Failed to fetch JWKS: {str(e)}")
            return False
        
        print(f"\n🎉 Azure AD authentication configuration is valid!")
        print("\nNext steps:")
        print("1. Start the FastAPI server: python main.py")
        print("2. Configure the frontend with the same Azure AD settings")
        print("3. Test the complete authentication flow")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing Azure AD Auth: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_auth_configuration()
    exit(0 if success else 1)