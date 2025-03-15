
import { predictionService } from './predictionService';
import { getAnalyticsData, getAdsData } from '../googleApi';

interface SalesPrediction {
  predictedRevenue: number;
  predictedROAS: number;
  predictedConversions: number;
  confidenceScore: number;
  marketingSpend: number;
  channelBreakdown: {
    [key: string]: {
      spend: number;
      predicted_revenue: number;
      roas: number;
    }
  }
}

export class SalesPredictionService {
  private static instance: SalesPredictionService;

  private constructor() {}

  public static getInstance(): SalesPredictionService {
    if (!SalesPredictionService.instance) {
      SalesPredictionService.instance = new SalesPredictionService();
    }
    return SalesPredictionService.instance;
  }

  private async trainModel(historicalData: any[]): Promise<void> {
    try {
      const trainingData = historicalData.map(record => ({
        features: {
          marketing_spend: record.spend,
          season: new Date(record.date).getMonth(),
          campaign_type: record.type,
          channel_mix: record.channels,
          historical_conversion_rate: record.conversionRate
        },
        labels: {
          revenue: record.revenue,
          roas: record.roas
        }
      }));

      await predictionService.trainModel({
        modelId: 'sales_prediction_model',
        trainingData,
        modelType: 'regression',
        hyperparameters: {
          learningRate: 0.01,
          epochs: 100,
          batchSize: 32
        }
      });
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  public async predictSales(tokens: any, startDate: string, endDate: string): Promise<SalesPrediction> {
    try {
      // Get data from Google services
      const analyticsData = await getAnalyticsData(tokens, 'viewId', startDate, endDate);
      const adsData = await getAdsData(tokens, 'customerId', startDate, endDate);
      
      // Train model with historical data
      const historicalData = await this.getHistoricalData(startDate, endDate);
      await this.trainModel(historicalData);

      // Calculate current metrics
      const totalSpend = adsData.totalSpend;
      const currentRevenue = analyticsData.revenue;
      const currentROAS = currentRevenue / totalSpend;
      const conversionRate = analyticsData.conversions / analyticsData.clicks;

      // Use prediction service for future metrics
      const prediction = await predictionService.predictCampaignPerformance({
        campaignId: 'sales_forecast',
        campaignName: 'Sales Forecast',
        platform: 'all',
        budget: totalSpend,
        targetAudience: ['all'],
        startDate,
        endDate,
        objective: 'conversion',
        creativeType: ['all'],
        historicalCTR: analyticsData.clicks / analyticsData.impressions,
        historicalConversionRate: conversionRate,
      });

      // Generate channel breakdown
      const channelBreakdown = adsData.campaigns.reduce((acc: any, campaign: any) => {
        acc[campaign.name] = {
          spend: campaign.budget,
          predicted_revenue: campaign.budget * prediction.predictedROAS,
          roas: prediction.predictedROAS
        };
        return acc;
      }, {});

      return {
        predictedRevenue: totalSpend * prediction.predictedROAS,
        predictedROAS: prediction.predictedROAS,
        predictedConversions: prediction.predictedConversions,
        confidenceScore: prediction.confidenceScore,
        marketingSpend: totalSpend,
        channelBreakdown
      };
    } catch (error) {
      console.error('Error predicting sales:', error);
      throw error;
    }
  }
}

export const salesPredictionService = SalesPredictionService.getInstance();
