
import { BigQuery } from '@google-cloud/bigquery';
import { LookerNodeSDK } from '@google-cloud/looker-sdk';
import { PubSub } from '@google-cloud/pubsub';
import { storage } from '../storage';

export class BigQueryETLService {
  private static instance: BigQueryETLService;
  private bigquery: BigQuery;
  private looker: LookerNodeSDK;
  private pubsub: PubSub;
  private datasetId = 'marketing_analytics';
  private tableId = 'campaign_metrics';
  private streamingTopic = 'realtime-marketing-data';

  private constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    this.pubsub = new PubSub({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    this.looker = new LookerNodeSDK({
      clientId: process.env.LOOKER_CLIENT_ID,
      clientSecret: process.env.LOOKER_CLIENT_SECRET,
      baseUrl: process.env.LOOKER_BASE_URL
    });

    this.initializeStreaming();
  }

  private async initializeStreaming() {
    try {
      await this.pubsub.createTopic(this.streamingTopic);
      const subscription = await this.pubsub.topic(this.streamingTopic).createSubscription('etl-processor');
      
      subscription.on('message', async (message) => {
        try {
          const data = JSON.parse(message.data.toString());
          await this.streamToBigQuery(data);
          message.ack();
        } catch (error) {
          console.error('Error processing message:', error);
          message.nack();
        }
      });
    } catch (error) {
      console.error('Error initializing streaming:', error);
    }
  }

  private async streamToBigQuery(data: any) {
    const rows = this.transformData(data);
    await this.bigquery
      .dataset(this.datasetId)
      .table(this.tableId)
      .insert(rows, { 
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });
  }

  public async streamData(data: any) {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(data));
      await this.pubsub.topic(this.streamingTopic).publish(dataBuffer);
      return true;
    } catch (error) {
      console.error('Error streaming data:', error);
      throw error;
    }
  }

  public async createPredictionModel() {
    const query = `
      CREATE OR REPLACE MODEL \`${this.datasetId}.campaign_prediction_model\`
      OPTIONS(
        model_type='linear_reg',
        input_label_cols=['conversions'],
        DATA_SPLIT_METHOD='AUTO_SPLIT'
      ) AS
      SELECT
        platform,
        campaign_type,
        budget,
        impressions,
        clicks,
        conversions,
        cost,
        revenue
      FROM \`${this.datasetId}.${this.tableId}\`
      WHERE conversions IS NOT NULL
    `;

    const [job] = await this.bigquery.createQueryJob({ query });
    await job.getQueryResults();
  }

  public async getPrediction(features: any) {
    const query = `
      SELECT
        *
      FROM ML.PREDICT(
        MODEL \`${this.datasetId}.campaign_prediction_model\`,
        (${this.createPredictionFeatures(features)})
      )
    `;

    const [rows] = await this.bigquery.query(query);
    return rows[0];
  }

  private transformData(data: any) {
    return {
      timestamp: new Date(),
      ...data,
      processed_at: BigQuery.timestamp(new Date())
    };
  }

  private createPredictionFeatures(features: any) {
    return `SELECT
      '${features.platform}' as platform,
      '${features.campaignType}' as campaign_type,
      ${features.budget} as budget,
      ${features.impressions} as impressions,
      ${features.clicks} as clicks,
      ${features.cost} as cost`;
  }

  public static getInstance(): BigQueryETLService {
    if (!BigQueryETLService.instance) {
      BigQueryETLService.instance = new BigQueryETLService();
    }
    return BigQueryETLService.instance;
  }
}

export const bigQueryETLService = BigQueryETLService.getInstance();
