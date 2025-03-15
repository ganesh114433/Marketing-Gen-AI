# AI-Powered Digital Marketing Automation Platform

This application automatically generates and posts content to social media platforms based on calendar events and company special dates. It integrates with Google Ads and Analytics, provides campaign performance dashboards, and operates without human intervention for content distribution.

## Features

- **Auto-Posting Service**: Automatically posts content to social media platforms based on calendar events
- **Event Scheduler**: Detects special dates and schedules content for them
- **Content Generation**: Uses AI to generate marketing content
- **Campaign Analytics**: Integrates with Google Ads and Analytics for performance tracking
- **Automation API**: Endpoints for monitoring and controlling automation services

## Local Development

### Prerequisites

- Node.js 20 or higher
- NPM or Yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the application:
   ```
   npm run dev
   ```

## Google Cloud Deployment

### Prerequisites

- Google Cloud account with a project
- Google Cloud CLI (`gcloud`)
- Docker
- Terraform

### Deployment Steps

1. Set your OpenAI API key as an environment variable:
   ```
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. Run the deployment script:
   ```
   ./scripts/deploy.sh --project-id your-gcp-project-id
   ```

   Optional parameters:
   - `--region`: The Google Cloud region (default: `us-central1`)
   - `--app-name`: The name of the application (default: `marketing-automation`)
   - `--environment`: The deployment environment (default: `prod`)

3. The script will:
   - Set up your Google Cloud project
   - Build and push the Docker image
   - Apply the Terraform configuration
   - Deploy the application to Cloud Run
   - Output the service URL

## Least Privilege Access

The deployment uses a dedicated service account with minimal permissions:

- The Cloud Run service uses a dedicated service account
- The service account only has access to necessary resources (Secret Manager)
- Secrets are stored in Google Secret Manager
- API keys and credentials are never stored in the codebase

## Automation

The application includes two primary automation services:

1. **Auto-Posting Service**: Checks for events that are due to be posted and processes them.
2. **Event Scheduler**: Checks for upcoming special dates and schedules content for them.

These services operate on a regular interval and can be controlled through the automation API endpoints.

## API Endpoints

- `GET /api/automation/status`: Get the status of automation services
- `POST /api/automation/auto-posting`: Toggle the auto-posting service
- `POST /api/automation/event-scheduler`: Toggle the event scheduler service
- `POST /api/automation/check-events`: Force an immediate check for events to post
- `GET /api/automation/activity`: Get recent automation activity logs