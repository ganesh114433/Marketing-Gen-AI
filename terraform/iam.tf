
# Custom role for deployment automation
resource "google_project_iam_custom_role" "deployment_automation" {
  role_id     = "deploymentAutomation"
  title       = "Deployment Automation Role"
  description = "Custom role for deployment automation service account"
  permissions = [
    "compute.instances.create",
    "compute.instances.delete",
    "compute.instances.get",
    "compute.instances.list",
    "compute.instances.update",
    "cloudrun.services.create",
    "cloudrun.services.get",
    "cloudrun.services.update",
    "artifactregistry.repositories.create",
    "artifactregistry.repositories.delete",
    "artifactregistry.repositories.get",
    "artifactregistry.repositories.list",
    "bigquery.datasets.create",
    "bigquery.datasets.get",
    "bigquery.datasets.update",
    "bigquery.tables.create",
    "bigquery.tables.delete",
    "bigquery.tables.get",
    "bigquery.tables.update",
    "storage.buckets.create",
    "storage.buckets.delete",
    "storage.buckets.get",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "secretmanager.secrets.create",
    "secretmanager.secrets.delete",
    "secretmanager.secrets.get",
    "secretmanager.versions.add",
    "aiplatform.endpoints.create",
    "aiplatform.endpoints.delete",
    "aiplatform.endpoints.get",
    "aiplatform.models.create",
    "aiplatform.models.delete",
    "aiplatform.models.get",
    "pubsub.topics.create",
    "pubsub.topics.delete",
    "pubsub.topics.get",
    "pubsub.subscriptions.create",
    "pubsub.subscriptions.delete",
    "pubsub.subscriptions.get"
  ]
}

# Custom role for ETL operations
resource "google_project_iam_custom_role" "etl_operations" {
  role_id     = "etlOperations"
  title       = "ETL Operations Role"
  description = "Custom role for ETL operations"
  permissions = [
    "bigquery.datasets.get",
    "bigquery.tables.create",
    "bigquery.tables.get",
    "bigquery.tables.update",
    "bigquery.tables.getData",
    "bigquery.jobs.create",
    "storage.objects.create",
    "storage.objects.get",
    "storage.objects.list",
    "pubsub.topics.publish",
    "pubsub.subscriptions.consume"
  ]
}

# Assign roles to deployment service account
resource "google_project_iam_member" "deployment_sa_roles" {
  for_each = toset([
    "roles/iam.serviceAccountUser",
    "roles/cloudbuild.builds.editor",
    google_project_iam_custom_role.deployment_automation.id
  ])
  
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Assign roles to ETL service account
resource "google_project_iam_member" "etl_sa_roles" {
  for_each = toset([
    google_project_iam_custom_role.etl_operations.id,
    "roles/bigquery.dataEditor",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber"
  ])
  
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Additional required predefined roles
resource "google_project_iam_member" "additional_roles" {
  for_each = toset([
    "roles/aiplatform.user",
    "roles/secretmanager.secretAccessor",
    "roles/storage.objectViewer",
    "roles/monitoring.viewer"
  ])
  
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_service_account.email}"
}
