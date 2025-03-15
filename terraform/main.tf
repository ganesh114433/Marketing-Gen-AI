provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "cloud_run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloud_build_api" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam_api" {
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "app_repository" {
  provider      = google
  location      = var.region
  repository_id = "${var.app_name}-repo"
  format        = "DOCKER"
  description   = "Docker repository for ${var.app_name}"
  depends_on    = [google_project_service.artifact_registry_api]
}

# Create a service account for the Cloud Run service with least privilege
resource "google_service_account" "cloud_run_service_account" {
  account_id   = "${var.app_name}-sa"
  display_name = "Service Account for ${var.app_name} Cloud Run service"
  depends_on   = [google_project_service.iam_api]
}

# Create a Secret for the OpenAI API key
resource "google_secret_manager_secret" "openai_api_key" {
  secret_id = "openai-api-key"
  
  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager_api]
}

# Create a version for the secret with the actual API key value
resource "google_secret_manager_secret_version" "openai_api_key_version" {
  secret      = google_secret_manager_secret.openai_api_key.id
  secret_data = var.openai_api_key

  depends_on = [google_secret_manager_secret.openai_api_key]
}

# Grant access to the service account to access the secret
resource "google_secret_manager_secret_iam_member" "cloud_run_secret_access" {
  secret_id = google_secret_manager_secret.openai_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_service_account.email}"

  depends_on = [
    google_service_account.cloud_run_service_account,
    google_secret_manager_secret.openai_api_key
  ]
}

# Deploy the Cloud Run service
resource "google_cloud_run_v2_service" "app_service" {
  name     = var.app_name
  location = var.region

  template {
    containers {
      image = var.container_image

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "OPENAI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.openai_api_key.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    service_account = google_service_account.cloud_run_service_account.email
  }

  depends_on = [
    google_project_service.cloud_run_api,
    google_secret_manager_secret_version.openai_api_key_version
  ]
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_v2_service.app_service.name
  location = google_cloud_run_v2_service.app_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_cloud_run_v2_service.app_service]
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_v2_service.app_service.uri
}