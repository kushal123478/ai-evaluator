# AI Evaluator Azure Deployment

This Terraform configuration deploys the AI Evaluator application to Azure App Service using separate services for the frontend and backend.

## Architecture

- **Backend**: FastAPI application deployed to Azure Linux App Service with container support
- **Frontend**: React application deployed to Azure Linux App Service with container support
- **Separate App Service Plans**: Independent scaling for frontend and backend
- **CORS Configuration**: Properly configured to allow frontend-backend communication

## Prerequisites

1. **Azure CLI**: Install and login to Azure CLI
2. **Terraform**: Install Terraform >= 1.0
3. **Docker Images**: Your application images must be available in a container registry (Azure Container Registry, Docker Hub, etc.)

## Setup

1. **Configure Variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
   
   Update `terraform.tfvars` with your values:
   - Update Docker image names and registry
   - Set appropriate resource names
   - Configure custom domains if needed

2. **Initialize Terraform**:
   ```bash
   terraform init
   ```

3. **Plan Deployment**:
   ```bash
   terraform plan
   ```

4. **Deploy**:
   ```bash
   terraform apply
   ```

## Docker Image Requirements

### Backend Image
- Must expose port 8000
- Should include all dependencies from `requirements.txt`
- Environment variables:
  - `PYTHONUNBUFFERED=1` (automatically set)
  - `WEBSITES_PORT=8000` (automatically set)

### Frontend Image  
- Must expose port 80
- Should be built with production configuration
- Environment variables:
  - `VITE_API_BASE_URL` (automatically set to backend URL)
  - `WEBSITES_PORT=80` (automatically set)

## Building and Pushing Images

### Using Azure Container Registry

1. **Create ACR** (if not exists):
   ```bash
   az acr create --resource-group <your-rg> --name <your-registry> --sku Basic
   ```

2. **Login to ACR**:
   ```bash
   az acr login --name <your-registry>
   ```

3. **Build and Push Backend**:
   ```bash
   cd ai-evaluator-backend
   docker build -t <your-registry>.azurecr.io/ai-evaluator-backend:latest .
   docker push <your-registry>.azurecr.io/ai-evaluator-backend:latest
   ```

4. **Build and Push Frontend**:
   ```bash
   cd ai-evaluator-frontend
   docker build -t <your-registry>.azurecr.io/ai-evaluator-frontend:latest .
   docker push <your-registry>.azurecr.io/ai-evaluator-frontend:latest
   ```

## Configuration

### App Service Plans
- Default: B1 (Basic) tier for both frontend and backend
- Can be scaled up by changing `backend_sku_name` and `frontend_sku_name`
- Available SKUs: B1, B2, B3, S1, S2, S3, P1v2, P2v2, P3v2, etc.

### Custom Domains
- Set `frontend_custom_domain` and `backend_custom_domain` variables
- You'll need to configure DNS records separately
- SSL certificates are automatically managed by Azure

## Outputs

After deployment, Terraform outputs:
- Backend URL
- Frontend URL  
- App Service names
- Resource group name

## Scaling

To scale the applications:

1. **Vertical Scaling**: Change SKU in `terraform.tfvars` and apply
2. **Horizontal Scaling**: Configure auto-scaling rules in Azure Portal

## Monitoring

- Application Insights can be added for monitoring
- App Service logs are available in Azure Portal
- Container logs are accessible via Azure CLI or Portal

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

## Troubleshooting

### Common Issues

1. **Container startup failures**: Check App Service logs in Azure Portal
2. **CORS errors**: Verify frontend URL is correctly added to backend CORS settings
3. **Image pull errors**: Ensure App Service has access to your container registry

### Useful Commands

```bash
# Check App Service logs
az webapp log tail --name <app-name> --resource-group <rg-name>

# Restart App Service
az webapp restart --name <app-name> --resource-group <rg-name>

# Update container image
az webapp config container set --name <app-name> --resource-group <rg-name> --docker-custom-image-name <new-image>
```