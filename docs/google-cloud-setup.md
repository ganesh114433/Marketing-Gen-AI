
# Google Cloud Deployment Guide

This document outlines the deployment process for the AI-powered marketing automation platform on Google Cloud Platform.

## Initial Setup

### 1. Project and API Configuration
```bash
# Create a new project (optional)
gcloud projects create YOUR_PROJECT_ID

# Set the project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  dataflow.googleapis.com \
  pubsub.googleapis.com \
  datacatalog.googleapis.com
```

### 2. Authentication and Credentials
```bash
# Login to Google Cloud
gcloud auth login
gcloud auth application-default login

# Create a service account
gcloud iam service-accounts create marketing-automation-sa \
  --display-name="Marketing Automation Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:marketing-automation-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:marketing-automation-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## Infrastructure Deployment

### 1. Configure Terraform Variables
Create `terraform/terraform.tfvars`:
```hcl
project_id      = "YOUR_PROJECT_ID"
region          = "us-central1"
app_name        = "marketing-automation"
client_name     = "YOUR_CLIENT_NAME"
client_environment = "production"

# AI/ML Configuration
enable_vertex_ai = true
enable_bigquery_ml = true
enable_marketing_performance_prediction = true

# Data Processing
enable_dataflow = true
enable_pubsub = true
enable_real_time_predictions = true
```

### 2. Deploy Infrastructure
```bash
cd terraform
terraform init
terraform apply
```

## Application Configuration

### 1. Environment Variables
Required environment variables for deployment:
```
OPENAI_API_KEY=your_openai_api_key
GCP_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### 2. Database Setup
The application uses BigQuery for analytics and data storage:
```sql
-- Example marketing metrics table
CREATE TABLE IF NOT EXISTS `marketing_metrics`
(
  date DATE,
  platform STRING,
  campaign_id STRING,
  impressions INT64,
  clicks INT64,
  conversions INT64,
  cost FLOAT64
);
```

## Deployment Options

### 1. Cloud Run Deployment (Recommended)
```bash
# Build and deploy
gcloud run deploy marketing-automation \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account marketing-automation-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. Automated Deployment Script
Use the provided deployment script:
```bash
./scripts/deploy.sh --project-id YOUR_PROJECT_ID --region us-central1
```

## Monitoring and Management

### 1. Cloud Monitoring
- Set up alerts for:
  - Error rates
  - Latency thresholds
  - ML model performance
  - Resource utilization

### 2. Logging
```bash
# View application logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=marketing-automation"
```

### 3. Cost Management
- Enable budget alerts
- Monitor BigQuery usage
- Track AI/ML resource consumption

## Data Pipeline Architecture

```
Marketing Data → Cloud Storage → Dataflow → BigQuery → Vertex AI
       ↓             ↓            ↓           ↓           ↓
Raw Data → ETL Pipeline → Analytics → ML Training → Predictions
```

## Security Considerations

1. **Data Encryption**
   - Enable Cloud KMS for sensitive data
   - Use Secret Manager for API keys
   - Enable VPC Service Controls

2. **Access Control**
   - Use IAM roles and service accounts
   - Enable audit logging
   - Implement least privilege access

## Troubleshooting

Common issues and solutions:
1. **Permission Errors**
   - Verify service account roles
   - Check IAM bindings
   - Validate OAuth scopes

2. **Deployment Failures**
   - Check build logs
   - Verify resource quotas
   - Validate configuration files

3. **Performance Issues**
   - Monitor resource utilization
   - Check scaling configurations
   - Analyze query performance

## Support and Resources

For issues and updates:
1. Check Cloud Run logs
2. Monitor BigQuery job status
3. Review Vertex AI model metrics
4. Analyze Cloud Monitoring metrics

This deployment guide covers the core infrastructure. For specific features or customizations, refer to the respective service documentation.
