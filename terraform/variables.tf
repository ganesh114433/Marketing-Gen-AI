# Client Information
variable "client_name" {
  description = "Client name for resource naming and tagging"
  type        = string
  default     = "default"
}

variable "client_environment" {
  description = "Environment (production, staging, dev)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["production", "staging", "dev"], var.client_environment)
    error_message = "Environment must be one of: production, staging, dev"
  }
}

variable "client_location" {
  description = "Primary GCP region for client resources"
  type        = string
  default     = "us-central1"
}

# Resource naming
variable "resource_prefix" {
  description = "Prefix used for all resource names"
  type        = string
  default     = "mktauto"
}

# Project Settings
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

# Google AI and ML variables
variable "enable_google_ai" {
  description = "Enable Google AI Platform integration"
  type        = bool
  default     = false
}

variable "google_ai_api_key" {
  description = "Google AI Platform API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_vertex_ai" {
  description = "Enable Google Vertex AI integration"
  type        = bool
  default     = false
}

variable "vertex_ai_region" {
  description = "Google Vertex AI region"
  type        = string
  default     = "us-central1"
}

variable "enable_custom_prediction_models" {
  description = "Enable custom prediction models"
  type        = bool
  default     = false
}

variable "prediction_model_type" {
  description = "Type of prediction model to use (automl, custom, pretrained)"
  type        = string
  default     = "automl"
}

# Marketing performance model variables
variable "enable_marketing_performance_prediction" {
  description = "Enable marketing performance prediction model"
  type        = bool
  default     = false
}

variable "marketing_model_training_dataset" {
  description = "BigQuery dataset ID for training marketing performance model"
  type        = string
  default     = ""
}

variable "marketing_model_training_table" {
  description = "BigQuery table ID for training marketing performance model"
  type        = string
  default     = ""
}

variable "marketing_model_training_frequency" {
  description = "How often to retrain the marketing performance model (daily, weekly, monthly)"
  type        = string
  default     = "weekly"
}

# Data processing variables
variable "enable_dataflow" {
  description = "Enable Dataflow for ETL processing"
  type        = bool
  default     = false
}

variable "enable_pubsub" {
  description = "Enable Pub/Sub for real-time data streaming"
  type        = bool
  default     = false
}

variable "enable_bigquery_ml" {
  description = "Enable BigQuery ML for in-database machine learning"
  type        = bool
  default     = false
}

variable "enable_looker_studio" {
  description = "Enable Looker Studio for data visualization"
  type        = bool
  default     = false
}

variable "enable_dataproc" {
  description = "Enable Dataproc for distributed data processing"
  type        = bool
  default     = false
}

variable "dataproc_cluster_name" {
  description = "Name for the Dataproc cluster"
  type        = string
  default     = "marketing-etl-cluster"
}

variable "dataproc_workers" {
  description = "Number of workers for Dataproc cluster"
  type        = number
  default     = 2
}

variable "enable_data_catalog" {
  description = "Enable Data Catalog for data discovery and metadata management"
  type        = bool
  default     = false
}

# Real-time processing variables
variable "enable_real_time_predictions" {
  description = "Enable real-time prediction capabilities"
  type        = bool
  default     = false
}

variable "prediction_request_topic" {
  description = "Pub/Sub topic for real-time prediction requests"
  type        = string
  default     = "prediction-requests"
}

variable "prediction_result_topic" {
  description = "Pub/Sub topic for real-time prediction results"
  type        = string
  default     = "prediction-results"
}