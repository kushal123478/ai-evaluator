# Azure AD Authentication Setup

This guide explains how to configure Azure Active Directory authentication for the AI Evaluator application.

## Prerequisites

- Azure subscription with admin access
- Azure AD tenant
- Application registration permissions in Azure AD

## Azure AD App Registration

### 1. Register the Application

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure the application:
   - **Name**: `AI Evaluator`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Type: `Single-page application (SPA)`
     - URI: `http://localhost:3000` (for development)

### 2. Configure Authentication

1. In the app registration, go to **Authentication**
2. Add additional redirect URIs:
   - `http://localhost:3000` (development)
   - `https://your-production-domain.com` (production)
3. Under **Implicit grant and hybrid flows**, enable:
   - ✅ **ID tokens (used for implicit and hybrid flows)**
4. Under **Advanced settings**:
   - Set **Allow public client flows** to **No**
   - Set **Live SDK support** to **No**

### 3. Expose an API

1. Go to **Expose an API**
2. Click **Set** next to **Application ID URI**
3. Accept the default URI or customize it (e.g., `api://ai-evaluator`)
4. Click **Add a scope** and create:
   - **Scope name**: `access_as_user`
   - **Admin consent display name**: `Access AI Evaluator as user`
   - **Admin consent description**: `Allow the application to access AI Evaluator on behalf of the signed-in user`
   - **User consent display name**: `Access AI Evaluator`
   - **User consent description**: `Allow the application to access AI Evaluator on your behalf`
   - **State**: `Enabled`

### 4. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `User.Read` (to read user profile)
   - `email` (to read user email)
   - `openid` (for OpenID Connect)
   - `profile` (to read user profile)

### 5. Create Client Secret (for Backend)

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Set description: `AI Evaluator Backend Secret`
4. Set expiration: `24 months` (or as per your policy)
5. Copy the **Value** immediately (you won't see it again)

### 6. Note the Configuration Values

Copy these values for your environment configuration:
- **Application (client) ID**: Found on the Overview page
- **Directory (tenant) ID**: Found on the Overview page
- **Client secret**: The value you copied from step 5

## Environment Configuration

### Backend (.env)
```bash
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
```

### Frontend (.env.local)
```bash
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id-here
```

## User Assignment (Optional)

By default, all users in your Azure AD tenant can sign in. To restrict access:

1. Go to **Azure AD** > **Enterprise applications**
2. Find and select your **AI Evaluator** application
3. Go to **Properties**
4. Set **User assignment required?** to **Yes**
5. Go to **Users and groups**
6. Click **Add user/group**
7. Select specific users or groups who should have access

## Testing the Setup

1. Start your backend server with the Azure AD environment variables
2. Start your frontend with the Azure AD environment variables
3. Navigate to your application
4. You should be redirected to Microsoft login
5. After successful login, you should see the application interface

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your redirect URIs are correctly configured
2. **Token validation fails**: Check that tenant ID and client ID match
3. **Scope issues**: Verify the API scope is properly configured
4. **Permission denied**: Check user assignment requirements

### Token Validation

The backend validates tokens by:
1. Fetching public keys from Azure AD
2. Verifying the token signature
3. Validating token claims (audience, issuer, expiration)

### Scopes

The application requests these scopes:
- `openid`: Basic OpenID Connect
- `profile`: User profile information
- `email`: User email address
- `api://your-client-id/access_as_user`: Custom API access

## Security Considerations

1. **Client Secret**: Keep the client secret secure and rotate regularly
2. **Token Storage**: Tokens are stored in browser localStorage
3. **HTTPS**: Always use HTTPS in production
4. **Token Expiration**: Tokens are automatically refreshed
5. **Logout**: Implement proper logout to clear tokens