resource "azurerm_container_group" "backend" {
  name                = "${var.app_name}-backend"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type    = "Public"
  dns_name_label     = "${var.app_name}-backend"
  os_type            = "Linux"

  container {
    name   = "backend"
    image  = "mcr.microsoft.com/azuredocs/aci-helloworld:latest"
    cpu    = "0.5"
    memory = "1.0"

    ports {
      port     = 80
      protocol = "TCP"
    }
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
    name   = "frontend"
    image  = "mcr.microsoft.com/azuredocs/aci-helloworld:latest"
    cpu    = "0.5"
    memory = "1.0"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  tags = var.tags
}