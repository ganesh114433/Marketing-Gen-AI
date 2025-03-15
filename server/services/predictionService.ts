/**
 * Marketing Prediction Service
 * 
 * This service provides real-time and batch prediction capabilities for marketing performance
 * using Google Cloud services (BigQuery ML, Vertex AI) and real-time ETL processing.
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { Storage } from '@google-cloud/storage';
import { BigQuery } from '@google-cloud/bigquery';
import { PubSub } from '@google-cloud/pubsub';
import { v4 as uuidv4 } from 'uuid';
import { CampaignMetric, InsertCampaignMetric } from '../../shared/schema';
import { storage } from '../storage';

// Create clients for Google Cloud services
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const storageClient = process.env.GCP_PROJECT_ID ? new Storage() : null;
const bigqueryClient = process.env.GCP_PROJECT_ID ? new BigQuery() : null;
const pubsubClient = process.env.GCP_PROJECT_ID ? new PubSub() : null;

// Flag to determine if we're using real Google Cloud services or mock implementations
const useGoogleCloud = !!process.env.GCP_PROJECT_ID;

/**
 * Campaign Performance Prediction Request
 */
export interface CampaignPredictionRequest {
  campaignId: string;
  campaignName: string;
  platform: string;
  budget: number;
  targetAudience: string[];
  startDate: string;
  endDate: string;
  objective: 'awareness' | 'consideration' | 'conversion';
  creativeType: string[];
  historicalCTR?: number;
  historicalConversionRate?: number;
  industry?: string;
  geography?: string[];
  additionalFeatures?: Record<string, any>;
}

/**
 * Campaign Performance Prediction Response
 */
export interface CampaignPredictionResponse {
  predictionId: string;
  campaignId: string;
  predictedImpressions: number;
  predictedClicks: number;
  predictedCTR: number;
  predictedConversions: number;
  predictedConversionRate: number;
  predictedCPA: number;
  predictedROAS: number;
  confidenceScore: number;
  segmentPerformance?: Record<string, any>;
  timestamp: string;
  modelId: string;
  modelVersion: string;
}

/**
 * ETL Processing Config
 */
export interface ETLConfig {
  sourceType: 'bigquery' | 'storage' | 'api';
  sourcePath: string;
  destinationType: 'bigquery' | 'storage';
  destinationPath: string;
  transformations: string[];
  schedule?: string;
  realTime?: boolean;
}

/**
 * Prediction Service Singleton Class
 */
export class PredictionService {
  private static instance: PredictionService;
  
  // Configuration
  private etlConfigs: Map<string, ETLConfig> = new Map();
  private predictionRequestTopic = 'prediction-requests';
  private predictionResultTopic = 'prediction-results';
  private mlModel = 'campaign_performance_model';
  private datasetId = 'marketing_analytics';
  
  // Queue for handling prediction requests when Google Cloud is not available
  private predictionQueue: CampaignPredictionRequest[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize with default ETL configuration if needed
    this.etlConfigs.set('default', {
      sourceType: 'api',
      sourcePath: 'marketing_data',
      destinationType: 'bigquery',
      destinationPath: 'marketing_analytics.marketing_metrics',
      transformations: ['normalize', 'enrich'],
      realTime: true
    });
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }
  
  /**
   * Start the prediction service
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[prediction] Prediction service started');
    
    if (useGoogleCloud) {
      this.setupGoogleCloudListeners();
    } else {
      // Set up local processing for development
      this.processingInterval = setInterval(() => this.processLocalQueue(), 10000);
    }
  }
  
  /**
   * Stop the prediction service
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    console.log('[prediction] Prediction service stopped');
  }
  
  /**
   * Submit a campaign for performance prediction
   */
  public async predictCampaignPerformance(request: CampaignPredictionRequest): Promise<CampaignPredictionResponse> {
    const predictionId = uuidv4();
    console.log(`[prediction] Processing prediction request ${predictionId} for campaign ${request.campaignId}`);
    
    try {
      if (useGoogleCloud) {
        // Use Google Cloud services for prediction
        return await this.predictWithGoogleCloud(predictionId, request);
      } else {
        // Use local prediction for development
        return await this.predictWithOpenAI(predictionId, request);
      }
    } catch (error) {
      console.error(`[prediction] Error predicting campaign performance: ${error}`);
      throw new Error(`Failed to predict campaign performance: ${error.message}`);
    }
  }
  
  /**
   * Add or update an ETL configuration
   */
  public setETLConfig(configId: string, config: ETLConfig): void {
    this.etlConfigs.set(configId, config);
    console.log(`[prediction] ETL configuration '${configId}' updated`);
  }
  
  /**
   * Get an ETL configuration
   */
  public getETLConfig(configId: string): ETLConfig | undefined {
    return this.etlConfigs.get(configId);
  }
  
  /**
   * Run an ETL process with the specified configuration
   */
  public async runETLProcess(configId: string, data?: any): Promise<boolean> {
    const config = this.etlConfigs.get(configId);
    if (!config) {
      throw new Error(`ETL configuration '${configId}' not found`);
    }
    
    try {
      console.log(`[prediction] Running ETL process '${configId}'`);
      
      if (useGoogleCloud) {
        // Use Google Cloud services for ETL processing
        return await this.processETLWithGoogleCloud(config, data);
      } else {
        // Use local ETL processing for development
        return await this.processETLLocally(config, data);
      }
    } catch (error) {
      console.error(`[prediction] Error running ETL process: ${error}`);
      throw new Error(`Failed to run ETL process: ${error.message}`);
    }
  }
  
  /**
   * Configure prediction model settings
   */
  public configurePredictionModel(modelSettings: {
    mlModel?: string,
    datasetId?: string,
    predictionRequestTopic?: string,
    predictionResultTopic?: string
  }): void {
    if (modelSettings.mlModel) this.mlModel = modelSettings.mlModel;
    if (modelSettings.datasetId) this.datasetId = modelSettings.datasetId;
    if (modelSettings.predictionRequestTopic) this.predictionRequestTopic = modelSettings.predictionRequestTopic;
    if (modelSettings.predictionResultTopic) this.predictionResultTopic = modelSettings.predictionResultTopic;
    
    console.log(`[prediction] Prediction model configuration updated`);
  }
  
  /**
   * Use OpenAI to make predictions when Google Cloud is not available
   */
  private async predictWithOpenAI(predictionId: string, request: CampaignPredictionRequest): Promise<CampaignPredictionResponse> {
    try {
      // Get historical campaign data to use as context
      const historicalMetrics = await this.getHistoricalCampaignMetrics(request.platform);
      
      // Create a system prompt that includes historical data and instructions
      const systemPrompt = `
        You are an expert marketing analytics AI that predicts campaign performance metrics.
        You have access to the following historical campaign metrics:
        ${JSON.stringify(historicalMetrics, null, 2)}
        
        Based on this data and the campaign details, predict realistic performance metrics.
        Consider factors like platform, budget, target audience, objective, and creative type.
        Provide numerical predictions with realistic values based on industry benchmarks.
      `;
      
      // Send the request to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Predict performance for this campaign: ${JSON.stringify(request, null, 2)}` }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response and create a prediction
      const aiPrediction = JSON.parse(response.choices[0].message.content);
      
      // Generate reasonable prediction with some random variation
      const budget = request.budget;
      const ctr = aiPrediction.ctr || (Math.random() * 0.03 + 0.01); // 1-4% CTR
      const convRate = aiPrediction.conversionRate || (Math.random() * 0.05 + 0.01); // 1-6% conv rate
      const cpc = aiPrediction.cpc || (Math.random() * 1.5 + 0.5); // $0.50-$2.00 CPC
      const impressions = aiPrediction.impressions || Math.floor(budget / cpc * (1/ctr) * 100) / 100;
      const clicks = aiPrediction.clicks || Math.floor(impressions * ctr);
      const conversions = aiPrediction.conversions || Math.floor(clicks * convRate);
      const cpa = budget / (conversions || 1);
      const convValue = request.objective === 'conversion' ? (conversions * (Math.random() * 50 + 50)) : 0; // $50-100 per conversion
      const roas = convValue / budget;
      
      const prediction: CampaignPredictionResponse = {
        predictionId,
        campaignId: request.campaignId,
        predictedImpressions: aiPrediction.impressions || impressions,
        predictedClicks: aiPrediction.clicks || clicks,
        predictedCTR: aiPrediction.ctr || ctr,
        predictedConversions: aiPrediction.conversions || conversions,
        predictedConversionRate: aiPrediction.conversionRate || convRate,
        predictedCPA: aiPrediction.cpa || cpa,
        predictedROAS: aiPrediction.roas || roas,
        confidenceScore: aiPrediction.confidenceScore || 0.85,
        timestamp: new Date().toISOString(),
        modelId: 'openai-gpt4o',
        modelVersion: '1.0',
      };
      
      // Store the prediction in the database
      await this.storePredictionResult(prediction);
      
      return prediction;
    } catch (error) {
      console.error(`[prediction] OpenAI prediction error: ${error}`);
      throw new Error(`Failed to predict with OpenAI: ${error.message}`);
    }
  }
  
  /**
   * Use Google Cloud services for prediction
   */
  private async predictWithGoogleCloud(predictionId: string, request: CampaignPredictionRequest): Promise<CampaignPredictionResponse> {
    if (!bigqueryClient) {
      throw new Error('BigQuery client not available for predictions');
    }
    
    try {
      // Format request data for BigQuery ML
      const requestData = {
        campaign_id: request.campaignId,
        campaign_name: request.campaignName,
        platform: request.platform,
        budget: request.budget,
        target_audience: JSON.stringify(request.targetAudience),
        start_date: request.startDate,
        end_date: request.endDate,
        objective: request.objective,
        creative_type: JSON.stringify(request.creativeType),
        historical_ctr: request.historicalCTR || null,
        historical_conversion_rate: request.historicalConversionRate || null,
        industry: request.industry || null,
        geography: JSON.stringify(request.geography || []),
      };
      
      // Use ML.PREDICT in BigQuery to get predictions
      const query = `
        SELECT
          *
        FROM
          ML.PREDICT(MODEL \`${this.datasetId}.${this.mlModel}\`,
            (SELECT '${predictionId}' as prediction_id, * FROM UNNEST([${JSON.stringify(requestData)}])))
      `;
      
      const [rows] = await bigqueryClient.query(query);
      
      if (!rows || rows.length === 0) {
        throw new Error('No prediction results returned from BigQuery ML');
      }
      
      const result = rows[0];
      
      // Format the response
      const prediction: CampaignPredictionResponse = {
        predictionId,
        campaignId: request.campaignId,
        predictedImpressions: result.predicted_impressions,
        predictedClicks: result.predicted_clicks,
        predictedCTR: result.predicted_ctr,
        predictedConversions: result.predicted_conversions,
        predictedConversionRate: result.predicted_conversion_rate,
        predictedCPA: result.predicted_cpa,
        predictedROAS: result.predicted_roas,
        confidenceScore: result.confidence_score,
        timestamp: new Date().toISOString(),
        modelId: `${this.datasetId}.${this.mlModel}`,
        modelVersion: result.model_version || '1.0',
      };
      
      // Publish the prediction to the result topic
      if (pubsubClient) {
        const topicName = this.predictionResultTopic;
        const dataBuffer = Buffer.from(JSON.stringify(prediction));
        await pubsubClient.topic(topicName).publish(dataBuffer);
      }
      
      return prediction;
    } catch (error) {
      console.error(`[prediction] Google Cloud prediction error: ${error}`);
      throw new Error(`Failed to predict with Google Cloud: ${error.message}`);
    }
  }
  
  /**
   * Set up listeners for Google Cloud Pub/Sub
   */
  private setupGoogleCloudListeners(): void {
    if (!pubsubClient) {
      console.warn('[prediction] PubSub client not available, skipping listener setup');
      return;
    }
    
    const subscriptionName = `${this.predictionRequestTopic}-subscription`;
    
    const subscription = pubsubClient.subscription(subscriptionName);
    
    subscription.on('message', async (message) => {
      try {
        const request = JSON.parse(message.data.toString()) as CampaignPredictionRequest;
        console.log(`[prediction] Received prediction request via PubSub for campaign ${request.campaignId}`);
        
        // Process the prediction
        await this.predictCampaignPerformance(request);
        
        // Acknowledge the message
        message.ack();
      } catch (error) {
        console.error(`[prediction] Error processing PubSub message: ${error}`);
        
        // Don't acknowledge to allow retry
        message.nack();
      }
    });
    
    subscription.on('error', (error) => {
      console.error(`[prediction] PubSub subscription error: ${error}`);
    });
    
    console.log(`[prediction] Listening for prediction requests on ${subscriptionName}`);
  }
  
  /**
   * Process local prediction queue for development
   */
  private async processLocalQueue(): Promise<void> {
    if (this.predictionQueue.length === 0) return;
    
    const request = this.predictionQueue.shift();
    if (!request) return;
    
    try {
      console.log(`[prediction] Processing queued prediction for campaign ${request.campaignId}`);
      await this.predictCampaignPerformance(request);
    } catch (error) {
      console.error(`[prediction] Error processing queued prediction: ${error}`);
    }
  }
  
  /**
   * Get historical campaign metrics for context
   */
  private async getHistoricalCampaignMetrics(platform: string = 'all'): Promise<CampaignMetric[]> {
    try {
      // Get all users for demo data
      const users = await storage.getAllUsers();
      if (!users || users.length === 0) {
        return [];
      }
      
      // Combine metrics from all users
      let allMetrics: CampaignMetric[] = [];
      for (const user of users) {
        const userMetrics = await storage.getCampaignMetricsByUserId(user.id);
        if (userMetrics && userMetrics.length > 0) {
          allMetrics = [...allMetrics, ...userMetrics];
        }
      }
      
      // Filter by platform if specified
      if (platform && platform !== 'all') {
        allMetrics = allMetrics.filter(metric => metric.platform.toLowerCase() === platform.toLowerCase());
      }
      
      return allMetrics;
    } catch (error) {
      console.error(`[prediction] Error getting historical metrics: ${error}`);
      return [];
    }
  }
  
  /**
   * Store prediction result in the database
   */
  private async storePredictionResult(prediction: CampaignPredictionResponse): Promise<void> {
    try {
      // Convert prediction to campaign metric format
      const metricData: InsertCampaignMetric = {
        userId: 1, // Default user for now
        campaignId: prediction.campaignId,
        campaignName: `Prediction: ${prediction.campaignId}`,
        platform: 'prediction',
        date: new Date().toISOString().split('T')[0],
        impressions: prediction.predictedImpressions,
        clicks: prediction.predictedClicks,
        conversions: prediction.predictedConversions,
        cost: 0, // No cost for predictions
        predictionId: prediction.predictionId,
        confidenceScore: prediction.confidenceScore,
        metadata: {
          predictedCTR: prediction.predictedCTR,
          predictedConversionRate: prediction.predictedConversionRate,
          predictedCPA: prediction.predictedCPA,
          predictedROAS: prediction.predictedROAS,
          modelId: prediction.modelId,
          modelVersion: prediction.modelVersion
        }
      };
      
      // Store in database
      await storage.createCampaignMetric(metricData);
      
      console.log(`[prediction] Stored prediction ${prediction.predictionId} for campaign ${prediction.campaignId}`);
    } catch (error) {
      console.error(`[prediction] Error storing prediction: ${error}`);
    }
  }
  
  /**
   * Process ETL with Google Cloud services
   */
  private async processETLWithGoogleCloud(config: ETLConfig, data?: any): Promise<boolean> {
    if (!bigqueryClient || !storageClient) {
      throw new Error('Google Cloud clients not available for ETL processing');
    }
    
    try {
      console.log(`[prediction] Processing ETL with Google Cloud services`);
      
      // Handle different source types
      let sourceData;
      
      if (config.sourceType === 'bigquery') {
        // Source is a BigQuery table
        const [rows] = await bigqueryClient.query(`SELECT * FROM \`${config.sourcePath}\``);
        sourceData = rows;
      } else if (config.sourceType === 'storage') {
        // Source is a GCS file
        const [bucketName, ...objectPathParts] = config.sourcePath.split('/');
        const objectPath = objectPathParts.join('/');
        
        const [content] = await storageClient.bucket(bucketName).file(objectPath).download();
        sourceData = JSON.parse(content.toString());
      } else if (config.sourceType === 'api') {
        // Source is the provided data or API
        sourceData = data || await this.getHistoricalCampaignMetrics();
      }
      
      // Process transformations
      let transformedData = sourceData;
      for (const transformation of config.transformations) {
        transformedData = this.applyTransformation(transformation, transformedData);
      }
      
      // Write to destination
      if (config.destinationType === 'bigquery') {
        // Destination is a BigQuery table
        const [datasetId, tableId] = config.destinationPath.split('.');
        const dataset = bigqueryClient.dataset(datasetId);
        const table = dataset.table(tableId);
        
        await table.insert(transformedData);
        console.log(`[prediction] Data written to BigQuery table ${config.destinationPath}`);
      } else if (config.destinationType === 'storage') {
        // Destination is a GCS file
        const [bucketName, ...objectPathParts] = config.destinationPath.split('/');
        const objectPath = objectPathParts.join('/');
        
        await storageClient.bucket(bucketName).file(objectPath).save(
          JSON.stringify(transformedData, null, 2)
        );
        console.log(`[prediction] Data written to GCS file ${config.destinationPath}`);
      }
      
      return true;
    } catch (error) {
      console.error(`[prediction] Error in Google Cloud ETL process: ${error}`);
      throw new Error(`Failed to process ETL with Google Cloud: ${error.message}`);
    }
  }
  
  /**
   * Process ETL locally for development
   */
  private async processETLLocally(config: ETLConfig, data?: any): Promise<boolean> {
    try {
      console.log(`[prediction] Processing ETL locally`);
      
      // Handle different source types
      let sourceData;
      
      if (config.sourceType === 'api') {
        // Source is the provided data or API
        sourceData = data || await this.getHistoricalCampaignMetrics();
      } else {
        // For local development, we'll just use the provided data
        sourceData = data || [];
      }
      
      // Process transformations
      let transformedData = sourceData;
      for (const transformation of config.transformations) {
        transformedData = this.applyTransformation(transformation, transformedData);
      }
      
      // For local development, just log the output
      console.log(`[prediction] ETL process complete, processed ${transformedData.length} records`);
      
      return true;
    } catch (error) {
      console.error(`[prediction] Error in local ETL process: ${error}`);
      throw new Error(`Failed to process ETL locally: ${error.message}`);
    }
  }
  
  /**
   * Apply a transformation to data
   */
  private applyTransformation(transformation: string, data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];
    
    console.log(`[prediction] Applying transformation: ${transformation}`);
    
    switch (transformation) {
      case 'normalize':
        // Normalize field names and formats
        return data.map(item => {
          const normalized: Record<string, any> = {};
          
          // Convert keys to snake_case
          Object.keys(item).forEach(key => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            normalized[snakeKey] = item[key];
          });
          
          return normalized;
        });
        
      case 'enrich':
        // Add derived metrics
        return data.map(item => {
          const enriched = { ...item };
          
          // Calculate derived metrics if needed
          if (item.impressions && item.clicks) {
            enriched.ctr = item.clicks / item.impressions;
          }
          
          if (item.clicks && item.conversions) {
            enriched.conversion_rate = item.conversions / item.clicks;
          }
          
          if (item.cost && item.conversions && item.conversions > 0) {
            enriched.cpa = item.cost / item.conversions;
          }
          
          if (item.cost && item.revenue) {
            enriched.roas = item.revenue / item.cost;
          }
          
          return enriched;
        });
        
      case 'filter_nulls':
        // Remove null values
        return data.filter(item => {
          return item && Object.keys(item).length > 0;
        });
        
      case 'aggregate_daily':
        // Aggregate by date
        const aggregated: Record<string, any> = {};
        
        data.forEach(item => {
          if (!item.date) return;
          
          if (!aggregated[item.date]) {
            aggregated[item.date] = {
              date: item.date,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              cost: 0,
              revenue: 0
            };
          }
          
          // Sum key metrics
          ['impressions', 'clicks', 'conversions', 'cost', 'revenue'].forEach(metric => {
            if (item[metric]) {
              aggregated[item.date][metric] += item[metric];
            }
          });
        });
        
        return Object.values(aggregated);
        
      default:
        console.warn(`[prediction] Unknown transformation: ${transformation}`);
        return data;
    }
  }
}

// Export the singleton instance
export const predictionService = PredictionService.getInstance();