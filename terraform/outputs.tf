output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.main.name
}

output "backend_container_group_name" {
  description = "Name of the backend Container Group"
  value       = azurerm_container_group.backend.name
}

output "frontend_container_group_name" {
  description = "Name of the frontend Container Group"
  value       = azurerm_container_group.frontend.name
}

output "backend_url" {
  description = "URL of the backend application"
  value       = "http://${azurerm_container_group.backend.fqdn}"
}

output "frontend_url" {
  description = "URL of the frontend application"
  value       = "http://${azurerm_container_group.frontend.fqdn}"
}

output "backend_hostname" {
  description = "Hostname of the backend Container Group"
  value       = azurerm_container_group.backend.fqdn
}

output "frontend_hostname" {
  description = "Hostname of the frontend Container Group"
  value       = azurerm_container_group.frontend.fqdn
}

output "acr_login_server" {
  description = "Login server URL for the Azure Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "Admin username for the Azure Container Registry"
  value       = azurerm_container_registry.acr.admin_username
}

output "acr_admin_password" {
  description = "Admin password for the Azure Container Registry"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}