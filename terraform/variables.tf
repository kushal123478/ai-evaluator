variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "rg-ai-evaluator"
}

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
  default     = "East US"
}

variable "app_name" {
  description = "Base name for the application resources"
  type        = string
  default     = "ai-evaluator"
}

variable "backend_sku_name" {
  description = "SKU name for the backend App Service plan"
  type        = string
  default     = "F1"
}

variable "frontend_sku_name" {
  description = "SKU name for the frontend App Service plan"
  type        = string
  default     = "F1"
}

variable "backend_docker_image" {
  description = "Full Docker image name for the backend application (registry/name:tag)"
  type        = string
  default     = "aievaluatoracr.azurecr.io/ai-evaluator-backend:develop"
}

variable "frontend_docker_image" {
  description = "Full Docker image name for the frontend application (registry/name:tag)"
  type        = string
  default     = "aievaluatoracr.azurecr.io/ai-evaluator-frontend:develop"
}

variable "frontend_custom_domain" {
  description = "Custom domain for the frontend application (optional)"
  type        = string
  default     = ""
}

variable "backend_custom_domain" {
  description = "Custom domain for the backend application (optional)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "production"
    Project     = "ai-evaluator"
  }
}