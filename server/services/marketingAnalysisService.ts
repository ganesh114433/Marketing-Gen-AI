
import { openai } from '../openai';
import { predictionService } from './predictionService';
import { storage } from '../storage';

export class MarketingAnalysisService {
  private static instance: MarketingAnalysisService;

  private constructor() {}

  public static getInstance(): MarketingAnalysisService {
    if (!MarketingAnalysisService.instance) {
      MarketingAnalysisService.instance = new MarketingAnalysisService();
    }
    return MarketingAnalysisService.instance;
  }

  public async analyzeMarketingPerformance(userId: number, startDate: string, endDate: string) {
    const metrics = await storage.getCampaignMetricsByUserId(userId);
    const content = await storage.getContentEntriesByUserId(userId);
    
    // Analyze campaign performance
    const performanceAnalysis = await this.analyzeCampaignMetrics(metrics);
    
    // Analyze content effectiveness
    const contentAnalysis = await this.analyzeContentEffectiveness(content);
    
    // Get AI-powered recommendations
    const recommendations = await this.getAIRecommendations(performanceAnalysis, contentAnalysis);
    
    return {
      performanceAnalysis,
      contentAnalysis,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  private async analyzeCampaignMetrics(metrics: any[]) {
    const analysis = {
      overallPerformance: this.calculateOverallPerformance(metrics),
      channelPerformance: this.analyzeChannelPerformance(metrics),
      trends: this.identifyTrends(metrics)
    };
    
    return analysis;
  }

  private async analyzeContentEffectiveness(content: any[]) {
    return await Promise.all(content.map(async (item) => {
      const sentiment = await openai.analyzeSentiment(item.content);
      return {
        contentId: item.id,
        effectiveness: {
          engagement: item.engagement,
          sentiment,
          performance: item.performance
        }
      };
    }));
  }

  private async getAIRecommendations(performance: any, content: any) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing strategy expert. Analyze the data and provide actionable recommendations."
        },
        {
          role: "user",
          content: JSON.stringify({ performance, content })
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }
}

export const marketingAnalysisService = MarketingAnalysisService.getInstance();
