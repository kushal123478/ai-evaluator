resource "azurerm_container_group" "backend" {
  name                = "${var.app_name}-backend"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type    = "Public"
  dns_name_label     = "${var.app_name}-backend"
  os_type            = "Linux"

  container {
    name   = "ai-evaluator-backend"
    image  = var.backend_docker_image
    cpu    = "0.5"
    memory = "1.0"

    ports {
      port     = 8000
      protocol = "TCP"
    }

    environment_variables = {
      PYTHONUNBUFFERED = "1"
    }
  }

  image_registry_credential {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }

  tags = var.tags
}

resource "azurerm_container_group" "frontend" {
  name                = "${var.app_name}-frontend"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type    = "Public"
  dns_name_label     = "${var.app_name}-frontend"
  os_type            = "Linux"

  container {
    name   = "ai-evaluator-frontend"
    image  = var.frontend_docker_image
    cpu    = "0.5"
    memory = "1.0"

    ports {
      port     = 80
      protocol = "TCP"
    }

    environment_variables = {
      VITE_API_BASE_URL = "http://${var.app_name}-backend.${var.location}.azurecontainer.io:8000"
    }
  }

  image_registry_credential {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }

  tags = var.tags
}