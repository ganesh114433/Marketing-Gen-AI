
# AI-Powered Marketing Automation Platform

A comprehensive marketing automation platform that leverages AI for content generation, campaign management, and performance prediction using Google Cloud Platform services.

## Features

### Core Capabilities
- **Auto-Posting Service**: Automated social media content publishing
- **Event Scheduling**: Smart calendar-based content scheduling
- **AI Content Generation**: OpenAI-powered content creation
- **Campaign Analytics**: Real-time performance tracking
- **Email Marketing**: Automated customer engagement
- **Predictive Analytics**: ML-powered performance forecasting
- **Multi-Platform Support**: Integration with major social networks

### Technical Features
- Real-time ETL processing with BigQuery
- ML model training and deployment with Vertex AI
- Custom dashboards with Looker Studio
- Scalable infrastructure with Google Cloud
- Secure credential management

## Prerequisites

- Node.js 20 or higher
- Google Cloud Platform account
- OpenAI API access
- Social media platform developer accounts

## Local Development Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create the following environment variables:
   ```
   OPENAI_API_KEY=your_openai_key
   GCP_PROJECT_ID=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
   ```

3. **Initialize Development Server**
   ```bash
   npm run dev
   ```

## Google Cloud Setup

1. **Project Creation & API Configuration**
   - Create a new GCP project
   - Enable required APIs:
     - Google Analytics Admin API
     - Google Analytics Data API
     - Google Ads API
     - BigQuery API
     - Vertex AI API
     - Cloud Run API

2. **Google Analytics 4 Setup**
   - Create a GA4 property in Google Analytics
   - Configure your measurement ID (`G-XXXXXXXXXX`)
   - Set up data streams for web/app
   - Enable BigQuery linking:
     ```
     GA4 Property → Admin → BigQuery Links → Link
     ```
   - Configure custom dimensions and metrics for marketing insights

3. **Configuration Updates**
   Update `terraform/config.auto.tfvars`:
   ```hcl
   # Google Analytics Configuration
   google_analytics = {
     measurement_id     = "G-XXXXXXXXXX"
     property_id       = "XXXXXXXXX"
     stream_id         = "XXXXXXXXX"
     bigquery_export   = true
     export_dataset    = "analytics_data"
     custom_dimensions = ["campaign_id", "source_medium", "content_type"]
   }

   # Google Ads Configuration
   google_ads = {
     customer_id       = "XXX-XXX-XXXX"
     developer_token   = "XXXXXXXXX"
     refresh_token    = "XXXXXXXXX"
     linked_analytics = true
   }
   ```

4. **Service Account Setup**
   - Create a service account with these roles:
     - BigQuery Data Viewer
     - BigQuery Job User
     - Analytics Viewer
     - Analytics Data Analyst

2. **Infrastructure Setup**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Update terraform.tfvars with your configuration
   terraform init
   terraform apply
   ```

3. **Data Storage Configuration**
   - BigQuery datasets for analytics
   - Cloud Storage buckets for assets
   - Pub/Sub topics for real-time processing

## AI Model Configuration

1. **Marketing Performance Prediction**
   - Configure BigQuery ML models
   - Set up Vertex AI datasets
   - Initialize prediction service endpoints

2. **Content Generation**
   - Configure OpenAI integration
   - Set up prompt templates
   - Initialize content generation service

## Deployment Steps

1. **Set Required Environment Variables**
   ```bash
   OPENAI_API_KEY=your_openai_key
   GCP_PROJECT_ID=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
   GOOGLE_ANALYTICS_ID=your_ga4_id
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm run test
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Deploy to Google Cloud**
   - Ensure you have Google Cloud CLI installed
   - Authenticate with: `gcloud auth login`
   - Set project: `gcloud config set project YOUR_PROJECT_ID`
   - Deploy:
   ```bash
   gcloud run deploy marketing-automation \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --service-account YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

6. **Verify Deployment**
   - Check Cloud Run console for service status
   - Verify application logs
   - Test endpoints using provided service URL
   - Monitor BigQuery data ingestion
   - Verify Looker Studio dashboard connectivity

The application will be accessible at the Cloud Run service URL provided after deployment.

## Service Architecture

### Data Flow
1. **Data Collection**
   - Marketing metrics ingestion
   - Social media engagement tracking
   - Customer interaction logging

2. **Processing Pipeline**
   - Real-time ETL with BigQuery
   - ML model predictions
   - Performance analytics

3. **Content Distribution**
   - Multi-platform publishing
   - Automated scheduling
   - Performance tracking

### Security Configuration

1. **Authentication**
   - OAuth2 for social platforms
   - API key management
   - Service account configuration

2. **Authorization**
   - IAM role setup
   - Resource access control
   - Least privilege principles

## Looker Studio Integration

1. **Data Source Configuration**
   - Connect BigQuery datasets:
     ```
     marketing_data.campaign_metrics
     marketing_data.user_behavior
     analytics_data.events_*
     ```
   - Configure refresh settings (15 min recommended)
   - Set up data joins on campaign_id and date dimensions

2. **Dashboard Templates**
   - Marketing Performance Overview
   - Campaign Attribution Analysis
   - User Journey Analysis
   - ROI Tracking Dashboard
   - Cross-Platform Performance

3. **Custom Metrics Setup**
   - Configure calculated fields
   - Set up custom dimensions
   - Create blended data views

## Monitoring and Maintenance

1. **Performance Monitoring**
   - Cloud Monitoring dashboards
   - Alert configuration
   - Log analysis

2. **System Updates**
   - Model retraining schedule
   - Performance optimization
   - Security updates

## Development Guidelines

1. **Code Structure**
   - Server: Express.js backend with TypeScript
   - Client: React frontend with Vite
   - Shared: Common types and utilities

2. **Testing**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for workflows

3. **Best Practices**
   - Code style guidelines
   - Documentation standards
   - Review process

## Troubleshooting

Common issues and solutions:
- Model prediction errors
- ETL pipeline failures
- Authentication issues
- Deployment problems

## AI Chatbot Integration

The platform includes a self-training AI chatbot that provides real-time marketing insights:

### Data Collection & Training Pipeline

1. **Real-time Data Integration**
   - Automatic collection of marketing metrics
   - Integration with Google Analytics, Ads, and Salesforce
   - Real-time ETL processing via BigQuery

2. **Automated Training Process**
   - Continuous data preprocessing using Cloud Functions
   - Daily model updates using Vertex AI
   - Automated fine-tuning with new marketing data

3. **Knowledge Base Updates**
   - Automatic indexing of new marketing data
   - Real-time vector embeddings for semantic search
   - Dynamic context window updates

### Training Architecture

```
Marketing Data → ETL Pipeline → BigQuery → Vertex AI
       ↓             ↓            ↓           ↓
   Raw Data → Preprocessing → Training Set → Model Update
       ↓                                      ↓
   Insights ←——————— Chatbot Interface ←—— Deployment
```

The chatbot automatically:
- Processes new marketing data every 6 hours
- Updates its knowledge base with new insights
- Retrains on new patterns and trends
- Maintains historical context for predictions

## Contact and Support

For issues and feature requests:
- Use the repository issue tracker
- Follow contribution guidelines
- Review security policies

## License

This project is proprietary and confidential.


## Configuration File

To successfully set up the infrastructure for our application in Google Cloud Platform (GCP), it is essential to configure the settings in the `terraform/config.auto.tfvars` file. This file contains key configurations that dictate various aspects of the deployment.

### Key Configuration Parameters

- **client_name**: This parameter is used for resource naming, helping to identify resources associated with your organization.
- **client_environment**: Specify the environment for your deployment (e.g., production, staging, dev).
- **project_id**: Your unique GCP project ID, which is required to associate all resources under this project.
- **container_image**: The path to the Docker image used for your application, hosted in the Artifact Registry.
- **openai_api_key**: Include your OpenAI API key for AI functionalities within the application.

Ensure that you update these fields according to your specific deployment requirements to ensure proper resource allocation and functionality.