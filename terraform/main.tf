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

# Create a GCS bucket for analytics data
resource "google_storage_bucket" "analytics_data_bucket" {
  name          = "${var.project_id}-marketing-analytics"
  location      = var.region
  force_destroy = var.bucket_force_destroy
  
  # Enable versioning for recovery
  versioning {
    enabled = true
  }
  
  # Set lifecycle rules to manage old data
  lifecycle_rule {
    condition {
      age = 90 # days
    }
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
  
  # Optional: Configure object lifecycle to automatically delete old data
  lifecycle_rule {
    condition {
      age = 365 # days
    }
    action {
      type = "Delete"
    }
  }
  
  # Enable uniform bucket-level access
  uniform_bucket_level_access = true
  
  depends_on = [google_project_service.required_services]
}

# Create a BigQuery dataset for marketing analytics
resource "google_bigquery_dataset" "marketing_analytics_dataset" {
  dataset_id                  = "marketing_analytics"
  friendly_name               = "Marketing Analytics Dataset"
  description                 = "Dataset for marketing analytics and reporting"
  location                    = var.region
  delete_contents_on_destroy  = var.dataset_delete_contents

  # Optional: Set expiration for tables (in milliseconds)
  default_table_expiration_ms = 7776000000 # 90 days
  
  # Enable access control
  access {
    role          = "OWNER"
    user_by_email = google_service_account.app_service_account.email
  }
  
  # Optional: Add labels for resource organization
  labels = {
    environment = var.environment
  }
  
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