# Azure AD Authentication Implementation

This document describes the Azure Active Directory (Azure AD) authentication implementation for the AI Evaluator application.

## Implementation Overview

The authentication system uses Azure AD with the following components:

### Backend (FastAPI)
- **JWT Token Validation**: Validates Azure AD tokens using public keys
- **Protected Routes**: All API endpoints require authentication
- **User Information**: Extracts user details from JWT claims
- **CORS Configuration**: Configured for authenticated requests

### Frontend (React)
- **MSAL React**: Microsoft Authentication Library for React
- **Protected Routes**: All pages require authentication
- **Token Management**: Automatic token refresh and storage
- **User Interface**: Login page and user profile components

## Key Files Added/Modified

### Backend Files
```
ai-evaluator-backend/
├── auth.py                    # Azure AD authentication logic
├── main.py                   # Updated with auth dependencies
├── requirements.txt          # Added MSAL and JWT dependencies
└── .env.example             # Azure AD environment variables
```

### Frontend Files
```
ai-evaluator-frontend/
├── src/auth/
│   ├── authConfig.ts         # MSAL configuration
│   └── AuthProvider.tsx      # React auth context
├── src/components/
│   ├── LoginPage.tsx         # Login interface
│   ├── ProtectedRoute.tsx    # Route protection
│   └── UserProfile.tsx       # User profile dropdown
├── src/hooks/
│   └── useApi.ts            # Authenticated API requests
├── package.json             # Added MSAL dependencies
└── .env.example             # Azure AD environment variables
```

## Authentication Flow

1. **User visits application**
   - Redirected to Azure AD login if not authenticated
   - MSAL handles the OAuth 2.0 flow

2. **Token Acquisition**
   - User authenticates with Azure AD
   - Receives JWT access token and ID token
   - Tokens stored securely in browser

3. **API Requests**
   - Frontend includes access token in Authorization header
   - Backend validates token using Azure AD public keys
   - User information extracted from token claims

4. **Token Refresh**
   - MSAL automatically refreshes expired tokens
   - Seamless user experience without re-authentication

## Security Features

### Backend Security
- **JWT Signature Validation**: Verifies token authenticity using Azure AD public keys
- **Audience Validation**: Ensures token was issued for this application
- **Issuer Validation**: Confirms token came from correct Azure AD tenant
- **Expiration Checking**: Validates token hasn't expired
- **Key Caching**: Public keys cached for performance with refresh mechanism

### Frontend Security
- **Secure Token Storage**: Uses browser localStorage with automatic cleanup
- **HTTPS Enforcement**: Recommended for production deployments
- **CORS Protection**: Configured to prevent unauthorized cross-origin requests
- **Automatic Logout**: Handles token expiration gracefully

## Environment Configuration

### Backend (.env)
```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
MONGODB_URL=mongodb://localhost:27017
PORT=8000
```

### Frontend (.env.local)
```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_API_BASE_URL=http://localhost:8000
```

## API Changes

### Protected Endpoints
All API endpoints now require authentication:
- `GET /api/documents` - List documents
- `POST /api/testcases/load/{id}` - Load test case
- `POST /api/feedback` - Create feedback
- `GET /api/dashboard/stats` - Dashboard statistics

### New Auth Endpoints
- `GET /api/auth/me` - Get current user information
- `GET /api/auth/config` - Get Azure AD configuration

### Request Format
```typescript
// Headers required for authenticated requests
Authorization: Bearer <access_token>
Content-Type: application/json
```

## User Experience

### Login Process
1. User visits application
2. Sees branded login page with Microsoft sign-in
3. Redirected to Azure AD authentication
4. Returns to application upon successful login

### User Interface
- **User Profile**: Dropdown showing user name, email, and sign-out option
- **Automatic Auth**: Tokens refreshed automatically in background
- **Error Handling**: Clear error messages for authentication failures

## Testing the Implementation

### Prerequisites
1. Azure AD tenant configured (see [azure-ad-setup.md](./azure-ad-setup.md))
2. Environment variables set correctly
3. Dependencies installed

### Backend Testing
```bash
cd ai-evaluator-backend
pip install -r requirements.txt
python main.py
```

### Frontend Testing
```bash
cd ai-evaluator-frontend
npm install
npm run dev
```

### Integration Testing
1. Start both backend and frontend
2. Navigate to `http://localhost:3000`
3. Should redirect to Azure AD login
4. After login, should access protected application

## Troubleshooting

### Common Issues

#### Token Validation Fails
- **Cause**: Incorrect tenant ID or client ID
- **Solution**: Verify environment variables match Azure AD app registration

#### CORS Errors
- **Cause**: Incorrect redirect URI configuration
- **Solution**: Ensure redirect URIs match in Azure AD and application

#### User Not Found
- **Cause**: User not assigned to application
- **Solution**: Check user assignment in Azure AD Enterprise Applications

#### Token Refresh Fails
- **Cause**: Invalid refresh token or expired session
- **Solution**: User will be prompted to re-authenticate

### Debug Information

#### Backend Logging
```python
# Add to main.py for debugging
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend Debugging
```typescript
// Enable MSAL logging
import { LogLevel } from '@azure/msal-browser';

// Add to authConfig.ts
export const msalConfig = {
  // ... existing config
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    }
  }
};
```

## Production Considerations

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Rotate client secrets regularly
- [ ] Configure appropriate CORS origins
- [ ] Enable audit logging
- [ ] Set up monitoring for authentication failures

### Performance Optimizations
- [ ] Configure CDN for static assets
- [ ] Enable token caching
- [ ] Optimize JWT validation with key caching
- [ ] Monitor authentication latency

### Monitoring
- [ ] Track authentication success/failure rates
- [ ] Monitor token refresh patterns
- [ ] Alert on authentication errors
- [ ] Log security events

## Future Enhancements

### Planned Features
- **Role-Based Access Control**: Implement user roles and permissions
- **Multi-Tenant Support**: Support for multiple Azure AD tenants
- **Session Management**: Enhanced session control and timeout
- **Audit Logging**: Comprehensive audit trail for user actions

### Potential Improvements
- **Conditional Access**: Integration with Azure AD Conditional Access policies
- **MFA Enforcement**: Require multi-factor authentication
- **Device Compliance**: Check device compliance before access
- **Risk-Based Authentication**: Dynamic authentication based on risk scores