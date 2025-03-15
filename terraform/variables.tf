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

variable "bucket_force_destroy" {
  description = "When deleting the bucket, delete all objects in the bucket"
  type        = bool
  default     = false
}

variable "dataset_delete_contents" {
  description = "When deleting the dataset, delete all tables in the dataset"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment label (e.g. prod, staging, dev)"
  type        = string
  default     = "production"
}

# Integration configuration variables
variable "enable_google_analytics" {
  description = "Enable Google Analytics integration"
  type        = bool
  default     = false
}

variable "google_client_id" {
  description = "Google OAuth Client ID for API integrations"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret for API integrations"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_salesforce" {
  description = "Enable Salesforce CRM integration"
  type        = bool
  default     = false
}

variable "salesforce_client_id" {
  description = "Salesforce OAuth Consumer Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "salesforce_client_secret" {
  description = "Salesforce OAuth Consumer Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_hubspot" {
  description = "Enable HubSpot CRM integration"
  type        = bool
  default     = false
}

variable "hubspot_api_key" {
  description = "HubSpot API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_facebook" {
  description = "Enable Facebook Marketing API integration"
  type        = bool
  default     = false
}

variable "facebook_app_id" {
  description = "Facebook App ID for Marketing API"
  type        = string
  default     = ""
  sensitive   = true
}

variable "facebook_app_secret" {
  description = "Facebook App Secret for Marketing API"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_twitter" {
  description = "Enable Twitter API integration"
  type        = bool
  default     = false
}

variable "twitter_api_key" {
  description = "Twitter API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "twitter_api_secret" {
  description = "Twitter API Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_linkedin" {
  description = "Enable LinkedIn Marketing API integration"
  type        = bool
  default     = false
}

variable "linkedin_client_id" {
  description = "LinkedIn Client ID"
  type        = string
  default     = ""
  sensitive   = true
}

variable "linkedin_client_secret" {
  description = "LinkedIn Client Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_mailchimp" {
  description = "Enable Mailchimp integration"
  type        = bool
  default     = false
}

variable "mailchimp_api_key" {
  description = "Mailchimp API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_shopify" {
  description = "Enable Shopify integration"
  type        = bool
  default     = false
}

variable "shopify_api_key" {
  description = "Shopify API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "shopify_api_secret" {
  description = "Shopify API Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_stripe" {
  description = "Enable Stripe payment processing integration"
  type        = bool
  default     = false
}

variable "stripe_api_key" {
  description = "Stripe API Key"
  type        = string
  default     = ""
  sensitive   = true
}