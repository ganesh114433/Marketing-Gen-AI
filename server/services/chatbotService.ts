
import { openai } from '../openai';
import { storage } from '../storage';
import { PredictionService } from './predictionService';
import { MarketingAnalysisService } from './marketingAnalysisService';

export class ChatbotService {
  private static instance: ChatbotService;
  private predictionService: PredictionService;
  private marketingAnalysis: MarketingAnalysisService;

  private constructor() {
    this.predictionService = PredictionService.getInstance();
    this.marketingAnalysis = MarketingAnalysisService.getInstance();
  }

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  public async processQuery(query: string, userId: number): Promise<string> {
    try {
      // Get context data
      const metrics = await storage.getCampaignMetricsByUserId(userId);
      const predictions = await this.predictionService.getHistoricalCampaignMetrics();
      const analysis = await this.marketingAnalysis.analyzeMarketingPerformance(
        userId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      );

      const systemPrompt = `
        You are an AI marketing analyst with access to the following data:
        - Campaign Metrics: ${JSON.stringify(metrics)}
        - Historical Predictions: ${JSON.stringify(predictions)}
        - Recent Analysis: ${JSON.stringify(analysis)}
        
        Provide insights and predictions based on this data. Be specific and data-driven in your responses.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
      });

      return response.choices[0].message.content || "I couldn't analyze the data at this moment.";
    } catch (error) {
      console.error('Chatbot processing error:', error);
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }
}

export const chatbotService = ChatbotService.getInstance();
