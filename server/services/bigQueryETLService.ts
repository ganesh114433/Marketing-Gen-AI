
import { BigQuery } from '@google-cloud/bigquery';
import { LookerNodeSDK } from '@google-cloud/looker-sdk';
import { storage } from '../storage';

export class BigQueryETLService {
  private static instance: BigQueryETLService;
  private bigquery: BigQuery;
  private looker: LookerNodeSDK;
  private datasetId = 'marketing_analytics';
  private tableId = 'campaign_metrics';

  private constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    this.looker = new LookerNodeSDK({
      clientId: process.env.LOOKER_CLIENT_ID,
      clientSecret: process.env.LOOKER_CLIENT_SECRET,
      baseUrl: process.env.LOOKER_BASE_URL
    });
  }

  public static getInstance(): BigQueryETLService {
    if (!BigQueryETLService.instance) {
      BigQueryETLService.instance = new BigQueryETLService();
    }
    return BigQueryETLService.instance;
  }

  public async streamData(data: any) {
    try {
      const rows = this.transformData(data);
      await this.bigquery
        .dataset(this.datasetId)
        .table(this.tableId)
        .insert(rows, { streamingBuffer: true });
      
      return true;
    } catch (error) {
      console.error('Error streaming data to BigQuery:', error);
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
}

export const bigQueryETLService = BigQueryETLService.getInstance();
