terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

# Commented out App Service Plans - using Container Instances instead
# resource "azurerm_service_plan" "backend" {
#   name                = "${var.app_name}-backend-plan"
#   resource_group_name = azurerm_resource_group.main.name
#   location           = azurerm_resource_group.main.location
#   os_type            = "Linux"
#   sku_name           = var.backend_sku_name

#   tags = var.tags
# }

# resource "azurerm_service_plan" "frontend" {
#   name                = "${var.app_name}-frontend-plan"
#   resource_group_name = azurerm_resource_group.main.name
#   location           = azurerm_resource_group.main.location
#   os_type            = "Linux"
#   sku_name           = var.frontend_sku_name

#   tags = var.tags
# }

# Commented out Web Apps - using Container Instances instead
# resource "azurerm_linux_web_app" "backend" {
#   name                = "${var.app_name}-backend"
#   resource_group_name = azurerm_resource_group.main.name
#   location           = azurerm_service_plan.backend.location
#   service_plan_id    = azurerm_service_plan.backend.id

#   site_config {
#     always_on = false
    
#     application_stack {
#       docker_image_name        = var.backend_docker_image
#       docker_registry_url      = "https://index.docker.io"
#     }
    
#     cors {
#       allowed_origins = [
#         "https://${var.app_name}-frontend.azurewebsites.net",
#         var.frontend_custom_domain != "" ? "https://${var.frontend_custom_domain}" : ""
#       ]
#       support_credentials = true
#     }
#   }

#   app_settings = {
#     PYTHONUNBUFFERED = "1"
#     WEBSITES_PORT    = "8000"
#   }

#   tags = var.tags
# }

# resource "azurerm_linux_web_app" "frontend" {
#   name                = "${var.app_name}-frontend"
#   resource_group_name = azurerm_resource_group.main.name
#   location           = azurerm_service_plan.frontend.location
#   service_plan_id    = azurerm_service_plan.frontend.id

#   site_config {
#     always_on = false
    
#     application_stack {
#       docker_image_name        = var.frontend_docker_image
#       docker_registry_url      = "https://index.docker.io"
#     }
#   }

#   app_settings = {
#     VITE_API_BASE_URL = "https://${azurerm_linux_web_app.backend.default_hostname}"
#     WEBSITES_PORT     = "80"
#   }

#   tags = var.tags
# }

# Commented out custom hostname bindings - not needed for Container Instances
# resource "azurerm_app_service_custom_hostname_binding" "frontend" {
#   count               = var.frontend_custom_domain != "" ? 1 : 0
#   hostname            = var.frontend_custom_domain
#   app_service_name    = azurerm_linux_web_app.frontend.name
#   resource_group_name = azurerm_resource_group.main.name
# }

# resource "azurerm_app_service_custom_hostname_binding" "backend" {
#   count               = var.backend_custom_domain != "" ? 1 : 0
#   hostname            = var.backend_custom_domain
#   app_service_name    = azurerm_linux_web_app.backend.name
#   resource_group_name = azurerm_resource_group.main.name
# }