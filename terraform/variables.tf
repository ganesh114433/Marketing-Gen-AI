variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region where resources will be created"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "marketing-automation"
}

variable "container_image" {
  description = "The URL of the container image to deploy"
  type        = string
}

variable "openai_api_key" {
  description = "The OpenAI API key for the application"
  type        = string
  sensitive   = true
}