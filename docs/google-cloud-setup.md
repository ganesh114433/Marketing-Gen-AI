# Google Cloud Deployment Guide

This guide explains how to deploy the AI-powered digital marketing automation platform to Google Cloud using Terraform and the provided scripts.

## Prerequisites

1. **Google Cloud Account and Project**
   - Create a Google Cloud account if you don't have one
   - Create a new project or use an existing one
   - Make note of your Google Cloud Project ID

2. **Google Cloud SDK**
   - Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
   - Initialize the SDK: `gcloud init`

3. **Terraform**
   - Install Terraform: https://developer.hashicorp.com/terraform/downloads
   - Verify installation: `terraform -v`

4. **Docker**
   - Install Docker: https://docs.docker.com/get-docker/
   - Verify installation: `docker --version`

## Setup Instructions

### 1. Prepare Your Environment

1. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. Enable the required Google Cloud APIs:
   ```bash
   gcloud services enable run.googleapis.com \
       artifactregistry.googleapis.com \
       cloudbuild.googleapis.com \
       iam.googleapis.com \
       secretmanager.googleapis.com
   ```

### 2. Deploy Using the Automated Script

Run the deployment script with your Google Cloud Project ID:

```bash
./scripts/deploy.sh --project-id your-gcp-project-id
```

This script will:
- Configure your Google Cloud project
- Create the necessary Terraform configuration
- Build and deploy the application
- Output the service URL when complete

### 3. Manual Deployment Steps

If you prefer to deploy manually or customize the deployment, follow these steps:

1. Create a `terraform.tfvars` file in the terraform directory:
   ```
   project_id      = "your-gcp-project-id"
   region          = "us-central1"
   app_name        = "marketing-automation"
   container_image = "us-central1-docker.pkg.dev/your-gcp-project-id/marketing-automation-repo/marketing-automation:latest"
   openai_api_key  = "your-openai-api-key"
   ```

2. Build the Docker image:
   ```bash
   docker build -t us-central1-docker.pkg.dev/your-gcp-project-id/marketing-automation-repo/marketing-automation:latest .
   ```

3. Configure Docker for Artifact Registry:
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

4. Push the Docker image:
   ```bash
   docker push us-central1-docker.pkg.dev/your-gcp-project-id/marketing-automation-repo/marketing-automation:latest
   ```

5. Apply the Terraform configuration:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

## Using GitHub Actions for CI/CD

If you want to use GitHub Actions for continuous deployment:

1. Add the following secrets to your GitHub repository:
   - `GCP_PROJECT_ID`: Your Google Cloud Project ID
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: Your Workload Identity Provider 
   - `GCP_SERVICE_ACCOUNT`: Your Google Cloud Service Account email
   - `GCP_SA_KEY`: Your Google Cloud Service Account key (JSON)
   - `OPENAI_API_KEY`: Your OpenAI API key

2. Push to the `main` branch to trigger the deployment workflow.

## Setting Up Workload Identity for GitHub Actions (Recommended)

For better security, use Workload Identity Federation instead of a service account key:

1. Enable the IAM Credentials API:
   ```bash
   gcloud services enable iamcredentials.googleapis.com
   ```

2. Create a workload identity pool:
   ```bash
   gcloud iam workload-identity-pools create "github-actions-pool" \
     --project="your-gcp-project-id" \
     --location="global" \
     --display-name="GitHub Actions Pool"
   ```

3. Create a workload identity provider:
   ```bash
   gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
     --project="your-gcp-project-id" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --display-name="GitHub Actions Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

4. Create a service account:
   ```bash
   gcloud iam service-accounts create "github-actions-sa" \
     --project="your-gcp-project-id" \
     --description="Service account for GitHub Actions" \
     --display-name="GitHub Actions Service Account"
   ```

5. Grant the service account necessary permissions:
   ```bash
   gcloud projects add-iam-policy-binding your-gcp-project-id \
     --member="serviceAccount:github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding your-gcp-project-id \
     --member="serviceAccount:github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.admin"
   
   gcloud projects add-iam-policy-binding your-gcp-project-id \
     --member="serviceAccount:github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   gcloud projects add-iam-policy-binding your-gcp-project-id \
     --member="serviceAccount:github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

6. Allow GitHub Actions to impersonate the service account:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com \
     --project="your-gcp-project-id" \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/your-gcp-project-number/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/your-github-org/your-repo"
   ```

7. Get the Workload Identity Provider resource name:
   ```bash
   gcloud iam workload-identity-pools providers describe github-actions-provider \
     --project="your-gcp-project-id" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --format="value(name)"
   ```
   
8. Add this value as the `GCP_WORKLOAD_IDENTITY_PROVIDER` secret in GitHub.