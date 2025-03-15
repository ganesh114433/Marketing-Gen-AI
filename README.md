
# AI-Powered Digital Marketing Automation Platform

This application automatically generates and posts content to social media platforms based on calendar events and company special dates. It integrates with Google Ads and Analytics, provides campaign performance dashboards, and operates without human intervention for content distribution.

## Features

- **Auto-Posting Service**: Automatically posts content to social media platforms based on calendar events
- **Event Scheduler**: Detects special dates and schedules content for them
- **Content Generation**: Uses AI to generate marketing content
- **Campaign Analytics**: Integrates with Google Ads and Analytics for performance tracking
- **Automation API**: Endpoints for monitoring and controlling automation services
- **AI Prediction**: Real-time campaign performance prediction using BigQuery ML and Looker Studio
- **Email Marketing**: Automated customer engagement through calendar events
- **Sales Analytics**: Predictive analytics based on digital spend and marketing metrics
- **Multi-Platform Integration**: Support for Facebook and other social media platforms

## Local Development

### Prerequisites

- Node.js 20 or higher
- NPM or Yarn
- Google Cloud credentials for BigQuery and Looker integration

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GCP_PROJECT_ID=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
   ```
4. Run the application:
   ```
   npm run dev
   ```

## Features Configuration

### AI Prediction Service
The platform uses BigQuery and Looker Studio for real-time ETL and predictions:
- Automated data processing pipeline
- Real-time campaign performance predictions
- Machine learning model training
- Custom dashboards in Looker Studio

### Marketing Automation
- Calendar-based event triggering
- Multi-platform content posting
- Email campaign automation
- Customer engagement tracking
- Performance analytics

### Sales Analytics
- Digital spend analysis
- ROI tracking
- Predictive sales modeling
- Customer segmentation
- Campaign attribution

## API Endpoints

- `GET /api/automation/status`: Get the status of automation services
- `POST /api/automation/auto-posting`: Toggle the auto-posting service
- `POST /api/automation/event-scheduler`: Toggle the event scheduler service
- `POST /api/automation/check-events`: Force an immediate check for events to post
- `GET /api/automation/activity`: Get recent automation activity logs
- `GET /api/predictions`: Get campaign performance predictions
- `GET /api/analytics/sales`: Get sales analytics data
- `POST /api/marketing/trigger`: Trigger marketing campaign posts

## Data Storage

The application stores data in three main locations:
- Raw data: Unprocessed campaign and analytics data
- Processed data: Cleaned and normalized data
- Transformed data: Analysis-ready data with derived metrics

## Security

- Secure credential storage
- OAuth2 authentication for social media platforms
- Environment-based configuration
- Least privilege access principles

## Support

For issues and feature requests, please use the issue tracker in the repository.
