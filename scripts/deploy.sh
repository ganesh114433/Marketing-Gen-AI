#!/bin/bash
set -e

# Check for required commands
for cmd in docker gcloud terraform; do
  if ! command -v $cmd &> /dev/null; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Default values
PROJECT_ID=""
REGION="us-central1"
APP_NAME="marketing-automation"
ENVIRONMENT="prod"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --project-id)
      PROJECT_ID="$2"
      shift
      shift
      ;;
    --region)
      REGION="$2"
      shift
      shift
      ;;
    --app-name)
      APP_NAME="$2"
      shift
      shift
      ;;
    --environment)
      ENVIRONMENT="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check required arguments
if [ -z "$PROJECT_ID" ]; then
  echo "Error: --project-id is required"
  exit 1
fi

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY environment variable is not set"
  exit 1
fi

# Set up Google Cloud project
echo "Setting up Google Cloud project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Create terraform.tfvars file
echo "Creating terraform.tfvars file"
cat > terraform/terraform.tfvars << EOF
project_id      = "$PROJECT_ID"
region          = "$REGION"
app_name        = "$APP_NAME"
container_image = "$REGION-docker.pkg.dev/$PROJECT_ID/$APP_NAME-repo/$APP_NAME:latest"
openai_api_key  = "$OPENAI_API_KEY"
EOF

# Build the Docker image
echo "Building Docker image"
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/$APP_NAME-repo/$APP_NAME:latest" .

# Configure Docker for Artifact Registry
echo "Configuring Docker for Artifact Registry"
gcloud auth configure-docker $REGION-docker.pkg.dev

# Initialize Terraform
echo "Initializing Terraform"
cd terraform
terraform init

# Apply Terraform configuration
echo "Applying Terraform configuration"
terraform apply -auto-approve

# Get the service URL
SERVICE_URL=$(terraform output -raw service_url)
echo "Deployment complete! Service URL: $SERVICE_URL"