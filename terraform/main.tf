terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local variables for resource naming and tagging
locals {
  # Standard naming convention: {prefix}-{client_name}-{environment}-{resource_type}
  resource_name_prefix = "${var.resource_prefix}-${var.client_name}-${var.client_environment}"
  
  # Resource-specific naming patterns
  bucket_prefix = "${local.resource_name_prefix}-bucket"
  dataset_prefix = "${local.resource_name_prefix}-dataset"
  model_prefix = "${local.resource_name_prefix}-model"
  service_prefix = "${local.resource_name_prefix}-service"
  
  # Common tags for all resources
  common_labels = {
    client        = var.client_name
    environment   = var.client_environment
    managed_by    = "terraform"
    application   = var.app_name
    created_date  = formatdate("YYYY-MM-DD", timestamp())
  }
}

# Enable required APIs
resource "google_project_service" "required_services" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "bigquery.googleapis.com"
  ])

  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create a Docker repository in Artifact Registry
resource "google_artifact_registry_repository" "app_repository" {
  provider = google-beta

  location      = var.region
  repository_id = "${var.app_name}-repo"
  description   = "Docker repository for ${var.app_name}"
  format        = "DOCKER"

  depends_on = [google_project_service.required_services]
}

# Create a Secret Manager secret for OpenAI API key
resource "google_secret_manager_secret" "openai_api_key" {
  secret_id = "openai-api-key"
  
  replication {
    automatic = true
  }

  depends_on = [google_project_service.required_services]
}

# Store the OpenAI API key in Secret Manager
resource "google_secret_manager_secret_version" "openai_api_key_version" {
  secret      = google_secret_manager_secret.openai_api_key.id
  secret_data = var.openai_api_key
}

# Create a service account for the Cloud Run service
resource "google_service_account" "app_service_account" {
  account_id   = "${var.app_name}-sa"
  display_name = "Service Account for ${var.app_name}"
}

# Grant the service account access to Secret Manager secret
resource "google_secret_manager_secret_iam_member" "app_secret_access" {
  secret_id = google_secret_manager_secret.openai_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Deploy application to Cloud Run
resource "google_cloud_run_service" "app_service" {
  name     = var.app_name
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        # Reference the OpenAI API key secret
        env {
          name = "OPENAI_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.openai_api_key.secret_id
              key  = "latest"
            }
          }
        }
      }
      
      service_account_name = google_service_account.app_service_account.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_artifact_registry_repository.app_repository,
    google_secret_manager_secret_version.openai_api_key_version,
    google_secret_manager_secret_iam_member.app_secret_access
  ]
}

# Allow public access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.app_service.name
  location = google_cloud_run_service.app_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create GCS buckets for data storage
resource "google_storage_bucket" "data_lake_bucket" {
  name          = "${local.bucket_prefix}-data-lake"
  location      = var.region
  force_destroy = var.bucket_force_destroy
  
  labels        = merge(local.common_labels, {
    data_type   = "data_lake"
    purpose     = "analytics"
  })
  
  # Enable versioning for recovery
  versioning {
    enabled = true
  }
  
  # Set lifecycle rules for raw data
  lifecycle_rule {
    condition {
      age = 365 # days
    }
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
  
  # Enable uniform bucket-level access
  uniform_bucket_level_access = true
  
  depends_on = [google_project_service.required_services]
}

# Create folders (prefixes) in the data lake bucket
resource "google_storage_bucket_object" "raw_data_folder" {
  name          = "raw/"
  content       = " "  # Empty content for folder creation
  bucket        = google_storage_bucket.data_lake_bucket.name
}

resource "google_storage_bucket_object" "processed_data_folder" {
  name          = "processed/"
  content       = " "  # Empty content for folder creation
  bucket        = google_storage_bucket.data_lake_bucket.name
}

resource "google_storage_bucket_object" "transformed_data_folder" {
  name          = "transformed/"
  content       = " "  # Empty content for folder creation
  bucket        = google_storage_bucket.data_lake_bucket.name
}

# Create a BigQuery dataset for marketing analytics
resource "google_bigquery_dataset" "marketing_analytics_dataset" {
  dataset_id                  = "${replace(local.dataset_prefix, "-", "_")}_marketing_analytics"
  friendly_name               = "${var.client_name} Marketing Analytics Dataset"
  description                 = "Dataset for marketing analytics and reporting for ${var.client_name}"
  location                    = var.region
  delete_contents_on_destroy  = var.dataset_delete_contents

  # Optional: Set expiration for tables (in milliseconds)
  default_table_expiration_ms = 7776000000 # 90 days
  
  # Enable access control
  access {
    role          = "OWNER"
    user_by_email = google_service_account.app_service_account.email
  }
  
  # Use consistent labels across resources
  labels = merge(local.common_labels, {
    data_type = "analytics"
    purpose   = "marketing"
  })
  
  depends_on = [google_project_service.required_services]
}

# Grant the service account access to the GCS bucket
resource "google_storage_bucket_iam_member" "app_storage_access" {
  bucket = google_storage_bucket.analytics_data_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Grant the service account access to BigQuery
resource "google_project_iam_member" "app_bigquery_access" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Create a BigQuery table for marketing metrics
resource "google_bigquery_table" "marketing_metrics_table" {
  dataset_id = google_bigquery_dataset.marketing_analytics_dataset.dataset_id
  table_id   = "marketing_metrics"
  
  time_partitioning {
    type = "DAY"
    field = "date"
  }
  
  schema = <<EOF
[
  {
    "name": "date",
    "type": "DATE",
    "mode": "REQUIRED",
    "description": "The date of the marketing metrics"
  },
  {
    "name": "platform",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Marketing platform (e.g., Google Ads, Facebook, Instagram)"
  },
  {
    "name": "campaign_id",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "ID of the marketing campaign"
  },
  {
    "name": "campaign_name",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Name of the marketing campaign"
  },
  {
    "name": "impressions",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of ad impressions"
  },
  {
    "name": "clicks",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of ad clicks"
  },
  {
    "name": "cost",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Campaign cost in USD"
  },
  {
    "name": "conversions",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of conversions"
  },
  {
    "name": "conversion_value",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Total conversion value in USD"
  },
  {
    "name": "ctr",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Click-through rate (clicks / impressions)"
  },
  {
    "name": "cpc",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Cost per click (cost / clicks)"
  },
  {
    "name": "roas",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Return on ad spend (conversion_value / cost)"
  }
]
EOF

  depends_on = [google_bigquery_dataset.marketing_analytics_dataset]
}

# Create a BigQuery table for content performance
resource "google_bigquery_table" "content_performance_table" {
  dataset_id = google_bigquery_dataset.marketing_analytics_dataset.dataset_id
  table_id   = "content_performance"
  
  time_partitioning {
    type = "DAY"
    field = "date"
  }
  
  schema = <<EOF
[
  {
    "name": "date",
    "type": "DATE",
    "mode": "REQUIRED",
    "description": "The date of content publication"
  },
  {
    "name": "content_id",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "ID of the content"
  },
  {
    "name": "content_title",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Title of the content"
  },
  {
    "name": "content_type",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Type of content (blog, social post, email, etc.)"
  },
  {
    "name": "platform",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Platform where content was published"
  },
  {
    "name": "views",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of content views"
  },
  {
    "name": "likes",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of likes/reactions"
  },
  {
    "name": "shares",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of shares/retweets"
  },
  {
    "name": "comments",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of comments"
  },
  {
    "name": "clicks",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of clicks on links in content"
  },
  {
    "name": "conversions",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Number of conversions attributed to content"
  },
  {
    "name": "engagement_rate",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Engagement rate ((likes + shares + comments) / views)"
  }
]
EOF

  depends_on = [google_bigquery_dataset.marketing_analytics_dataset]
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_service.app_service.status[0].url
}

# Output the GCS bucket name
output "analytics_bucket_name" {
  value = google_storage_bucket.analytics_data_bucket.name
  description = "The name of the GCS bucket for marketing analytics data"
}

# Output the BigQuery dataset ID
output "bigquery_dataset_id" {
  value = google_bigquery_dataset.marketing_analytics_dataset.dataset_id
  description = "The ID of the BigQuery dataset for marketing analytics"
}

# AI and ML resources
resource "google_project_service" "ai_apis" {
  count   = var.enable_google_ai || var.enable_vertex_ai ? 1 : 0
  project = var.project_id
  service = "aiplatform.googleapis.com"

  disable_dependent_services = false
  disable_on_destroy         = false
  depends_on                 = [google_project_service.required_services]
}

# Vertex AI Dataset for marketing performance prediction
resource "google_vertex_ai_dataset" "marketing_performance_dataset" {
  count        = var.enable_vertex_ai && var.enable_marketing_performance_prediction ? 1 : 0
  display_name = "${local.model_prefix}-marketing-performance"
  metadata_schema_uri = "gs://google-cloud-aiplatform/schema/dataset/metadata/tabular_1.0.0.yaml"
  region       = var.vertex_ai_region
  
  labels = merge(local.common_labels, {
    purpose = "marketing_prediction"
    data_type = "tabular"
  })
  
  depends_on = [google_project_service.ai_apis]
}

# Google Cloud Storage bucket for model artifacts
resource "google_storage_bucket" "model_artifacts_bucket" {
  count         = var.enable_vertex_ai && var.enable_custom_prediction_models ? 1 : 0
  name          = "${local.bucket_prefix}-model-artifacts"
  location      = var.region
  force_destroy = var.bucket_force_destroy
  
  labels        = merge(local.common_labels, {
    data_type   = "model"
    purpose     = "ai_artifacts"
  })
  
  # Enable versioning for model versions
  versioning {
    enabled = true
  }
  
  depends_on = [google_project_service.ai_apis]
}

# Vertex AI Model Registry for storing trained models
resource "google_vertex_ai_model" "marketing_performance_model" {
  count        = var.enable_vertex_ai && var.enable_marketing_performance_prediction ? 1 : 0
  display_name = "marketing-performance-prediction-model"
  metadata_schema_uri = "gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tabular_1.0.0.yaml"
  region       = var.vertex_ai_region
  
  depends_on = [google_project_service.ai_apis]
}

# Create an AI Notebook instance for data scientists to develop custom models
resource "google_notebooks_instance" "ai_notebook" {
  count        = var.enable_vertex_ai && var.enable_custom_prediction_models ? 1 : 0
  name         = "marketing-ai-notebook"
  location     = var.region
  machine_type = "n1-standard-4"
  
  vm_image {
    project      = "deeplearning-platform-release"
    image_family = "tf-ent-2-3-cpu"
  }
  
  depends_on = [google_project_service.ai_apis]
}

# Vertex AI feature store for prediction features
resource "google_vertex_ai_featurestore" "marketing_features" {
  count       = var.enable_vertex_ai && var.enable_marketing_performance_prediction ? 1 : 0
  name        = "marketing-features"
  region      = var.vertex_ai_region
  online_serving_config {
    fixed_node_count = 1
  }
  
  depends_on = [google_project_service.ai_apis]
}

# Feature for campaign performance prediction
resource "google_vertex_ai_featurestore_entitytype" "campaign_entity" {
  count          = var.enable_vertex_ai && var.enable_marketing_performance_prediction ? 1 : 0
  featurestore   = google_vertex_ai_featurestore.marketing_features[0].name
  entity_type_id = "campaign"
  description    = "Campaign entity for marketing performance prediction"
  monitoring_config {
    snapshot_analysis {
      disabled = false
      monitoring_interval_days = 1
    }
  }
  
  depends_on = [google_vertex_ai_featurestore.marketing_features]
}

# Output the Vertex AI dataset ID
output "vertex_ai_dataset_id" {
  value = var.enable_vertex_ai && var.enable_marketing_performance_prediction ? google_vertex_ai_dataset.marketing_performance_dataset[0].name : null
  description = "The ID of the Vertex AI dataset for marketing performance prediction"
}

# Output the model artifacts bucket name
output "model_artifacts_bucket_name" {
  value = var.enable_vertex_ai && var.enable_custom_prediction_models ? google_storage_bucket.model_artifacts_bucket[0].name : null
  description = "The name of the GCS bucket for model artifacts"
}

# ETL and real-time processing resources
resource "google_project_service" "data_services" {
  count   = var.enable_dataflow || var.enable_pubsub || var.enable_dataproc ? 1 : 0
  for_each = toset([
    "dataflow.googleapis.com",
    "pubsub.googleapis.com",
    "dataproc.googleapis.com",
    "datacatalog.googleapis.com",
    "bigqueryconnection.googleapis.com",
    "bigquerydatatransfer.googleapis.com"
  ])
  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy         = false
  depends_on                 = [google_project_service.required_services]
}

# BigQuery ML models
resource "google_bigquery_table" "campaign_performance_model" {
  count       = var.enable_bigquery_ml ? 1 : 0
  dataset_id  = google_bigquery_dataset.marketing_analytics_dataset.dataset_id
  table_id    = "campaign_performance_model"
  description = "BigQuery ML model for campaign performance prediction"
  deletion_protection = false

  depends_on = [google_bigquery_dataset.marketing_analytics_dataset]
}

# Google Cloud Dataflow templates bucket
resource "google_storage_bucket" "dataflow_templates_bucket" {
  count         = var.enable_dataflow ? 1 : 0
  name          = "${local.bucket_prefix}-dataflow-templates"
  location      = var.region
  force_destroy = var.bucket_force_destroy
  
  labels        = merge(local.common_labels, {
    data_type   = "dataflow"
    purpose     = "etl_templates"
  })
  
  depends_on = [google_project_service.data_services]
}

# Bucket for ETL scripts and assets
resource "google_storage_bucket" "etl_assets_bucket" {
  count         = var.enable_dataflow || var.enable_dataproc ? 1 : 0
  name          = "${local.bucket_prefix}-etl-assets"
  location      = var.region
  force_destroy = var.bucket_force_destroy
  
  labels        = merge(local.common_labels, {
    data_type   = "etl"
    purpose     = "data_processing"
  })
  
  depends_on = [google_project_service.data_services]
}

# ETL and data processing resources
resource "google_dataproc_cluster" "etl_cluster" {
  count      = var.enable_dataproc ? 1 : 0
  name       = var.dataproc_cluster_name
  region     = var.region
  
  cluster_config {
    staging_bucket = google_storage_bucket.etl_assets_bucket[0].name
    
    master_config {
      num_instances = 1
      machine_type  = "n1-standard-4"
    }
    
    worker_config {
      num_instances = var.dataproc_workers
      machine_type  = "n1-standard-4"
    }
    
    software_config {
      image_version = "2.0-debian10"
      override_properties = {
        "dataproc:dataproc.allow.zero.workers" = "true"
      }
      optional_components = ["JUPYTER"]
    }
  }
  
  depends_on = [google_project_service.data_services]
}

# Pub/Sub topics for real-time event streaming
resource "google_pubsub_topic" "prediction_request_topic" {
  count = var.enable_pubsub && var.enable_real_time_predictions ? 1 : 0
  name  = var.prediction_request_topic
  
  depends_on = [google_project_service.data_services]
}

resource "google_pubsub_topic" "prediction_result_topic" {
  count = var.enable_pubsub && var.enable_real_time_predictions ? 1 : 0
  name  = var.prediction_result_topic
  
  depends_on = [google_project_service.data_services]
}

# Pub/Sub subscription for processing prediction requests
resource "google_pubsub_subscription" "prediction_request_subscription" {
  count   = var.enable_pubsub && var.enable_real_time_predictions ? 1 : 0
  name    = "${var.prediction_request_topic}-subscription"
  topic   = google_pubsub_topic.prediction_request_topic[0].name
  
  # 7 days retention
  message_retention_duration = "604800s"
  
  # Process messages in order with 60 seconds timeout
  ack_deadline_seconds = 60
  
  # Enable exactly-once delivery
  enable_exactly_once_delivery = true
  
  depends_on = [google_pubsub_topic.prediction_request_topic]
}

# BigQuery external connection for Looker Studio
resource "google_bigquery_connection" "looker_connection" {
  count      = var.enable_looker_studio ? 1 : 0
  connection_id = "looker-studio-connection"
  location   = var.region
  friendly_name = "Looker Studio Connection"
  description = "Connection to enable Looker Studio to access marketing data"
  
  cloud_resource {
    service_account_id = google_service_account.app_service_account.email
  }

  properties = {
    "enableRealTimeData" = "true"
    "refreshSchedule" = "AUTO"
  }
  
  depends_on = [google_project_service.data_services]
}

# Data Catalog entries for datasets and ML models
resource "google_data_catalog_entry_group" "marketing_data_group" {
  count       = var.enable_data_catalog ? 1 : 0
  entry_group_id = "marketing-data"
  display_name   = "Marketing Data"
  description    = "Group for all marketing automation data resources"
  
  depends_on = [google_project_service.data_services]
}

# Schema for marketing metrics data in Data Catalog
resource "google_data_catalog_entry" "marketing_metrics_entry" {
  count          = var.enable_data_catalog ? 1 : 0
  entry_group    = google_data_catalog_entry_group.marketing_data_group[0].id
  entry_id       = "marketing-metrics"
  display_name   = "Marketing Metrics"
  description    = "Marketing metrics data for campaigns and performance analysis"
  
  schema = jsonencode({
    columns = [
      {name = "date", type = "DATE", description = "The date of the marketing metrics"},
      {name = "platform", type = "STRING", description = "Marketing platform"},
      {name = "campaign_id", type = "STRING", description = "ID of the marketing campaign"},
      {name = "impressions", type = "INTEGER", description = "Number of ad impressions"},
      {name = "clicks", type = "INTEGER", description = "Number of ad clicks"},
      {name = "conversions", type = "INTEGER", description = "Number of conversions"},
      {name = "cost", type = "FLOAT", description = "Campaign cost in USD"}
    ]
  })
  
  depends_on = [google_data_catalog_entry_group.marketing_data_group]
}

# Output the ETL assets bucket name
output "etl_assets_bucket_name" {
  value = var.enable_dataflow || var.enable_dataproc ? google_storage_bucket.etl_assets_bucket[0].name : null
  description = "The name of the GCS bucket for ETL assets and scripts"
}

# Output the Pub/Sub topics
output "prediction_request_topic" {
  value = var.enable_pubsub && var.enable_real_time_predictions ? google_pubsub_topic.prediction_request_topic[0].name : null
  description = "The name of the Pub/Sub topic for real-time prediction requests"
}

output "prediction_result_topic" {
  value = var.enable_pubsub && var.enable_real_time_predictions ? google_pubsub_topic.prediction_result_topic[0].name : null
  description = "The name of the Pub/Sub topic for real-time prediction results"
}

# Output the Dataproc cluster name
output "dataproc_cluster_name" {
  value = var.enable_dataproc ? google_dataproc_cluster.etl_cluster[0].name : null
  description = "The name of the Dataproc cluster for ETL processing"
}