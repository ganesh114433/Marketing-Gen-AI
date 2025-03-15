variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "marketing-automation"
}

variable "container_image" {
  description = "The container image to deploy"
  type        = string
}

variable "openai_api_key" {
  description = "The OpenAI API key"
  type        = string
  sensitive   = true
}

variable "min_instance_count" {
  description = "Minimum number of instances to run"
  type        = number
  default     = 1
}

variable "max_instance_count" {
  description = "Maximum number of instances to run"
  type        = number
  default     = 3
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run instances"
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run instances"
  type        = string
  default     = "512Mi"
}