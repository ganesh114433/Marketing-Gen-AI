/**
 * Integration Service
 * 
 * This service manages integrations with external platforms like Google Analytics, 
 * Salesforce, HubSpot, and various social media platforms. It provides a unified 
 * interface for connecting to these services and retrieving data.
 */

import { Integration, InsertIntegration } from '@shared/schema';
import { storage } from '../storage';
import { google } from 'googleapis';
import axios from 'axios';

// Integration type definitions
export type IntegrationType = 'analytics' | 'ads' | 'crm' | 'erp' | 'social' | 'email' | 'payment';

export type IntegrationProvider = 
  'google' | 'facebook' | 'twitter' | 'linkedin' | 'salesforce' | 
  'hubspot' | 'mailchimp' | 'shopify' | 'instagram' | 'stripe';

export type IntegrationService = 
  'google_analytics' | 'google_ads' | 'facebook_ads' | 'salesforce_crm' | 
  'hubspot_crm' | 'twitter_api' | 'linkedin_marketing' | 'instagram_api' | 
  'mailchimp_email' | 'shopify_store' | 'stripe_payment';

// Integration configuration interface
export interface IntegrationConfig {
  enabled: boolean;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  scopes?: string[];
  redirectUri?: string;
  additionalConfig?: Record<string, any>;
}

/**
 * Integration Service Singleton Class
 */
export class IntegrationService {
  private static instance: IntegrationService;
  private integrationConfigs: Map<IntegrationService, IntegrationConfig>;

  // Integration providers mapped to their OAuth endpoints and handlers
  private providerOAuthConfig: Record<IntegrationProvider, {
    authUrl: string;
    tokenUrl: string;
    getAuthUrlFn: (config: IntegrationConfig) => string;
    getTokensFn: (code: string, config: IntegrationConfig) => Promise<any>;
  }> = {
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      getAuthUrlFn: this.getGoogleAuthUrl.bind(this),
      getTokensFn: this.getGoogleTokens.bind(this)
    },
    facebook: {
      authUrl: 'https://www.facebook.com/v16.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v16.0/oauth/access_token',
      getAuthUrlFn: this.getFacebookAuthUrl.bind(this),
      getTokensFn: this.getFacebookTokens.bind(this)
    },
    twitter: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      getAuthUrlFn: this.getTwitterAuthUrl.bind(this),
      getTokensFn: this.getTwitterTokens.bind(this)
    },
    linkedin: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      getAuthUrlFn: this.getLinkedInAuthUrl.bind(this),
      getTokensFn: this.getLinkedInTokens.bind(this)
    },
    salesforce: {
      authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      getAuthUrlFn: this.getSalesforceAuthUrl.bind(this),
      getTokensFn: this.getSalesforceTokens.bind(this)
    },
    hubspot: {
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      getAuthUrlFn: this.getHubSpotAuthUrl.bind(this),
      getTokensFn: this.getHubSpotTokens.bind(this)
    },
    mailchimp: {
      authUrl: 'https://login.mailchimp.com/oauth2/authorize',
      tokenUrl: 'https://login.mailchimp.com/oauth2/token',
      getAuthUrlFn: this.getMailchimpAuthUrl.bind(this),
      getTokensFn: this.getMailchimpTokens.bind(this)
    },
    shopify: {
      authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
      tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
      getAuthUrlFn: this.getShopifyAuthUrl.bind(this),
      getTokensFn: this.getShopifyTokens.bind(this)
    },
    instagram: {
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      getAuthUrlFn: this.getInstagramAuthUrl.bind(this),
      getTokensFn: this.getInstagramTokens.bind(this)
    },
    stripe: {
      authUrl: 'https://connect.stripe.com/oauth/authorize',
      tokenUrl: 'https://connect.stripe.com/oauth/token',
      getAuthUrlFn: this.getStripeAuthUrl.bind(this),
      getTokensFn: this.getStripeTokens.bind(this)
    }
  };

  // Map of service names to their provider and type
  private serviceInfo: Record<IntegrationService, { 
    provider: IntegrationProvider, 
    type: IntegrationType,
    requiredScopes: string[]
  }> = {
    google_analytics: { 
      provider: 'google', 
      type: 'analytics',
      requiredScopes: ['https://www.googleapis.com/auth/analytics.readonly']
    },
    google_ads: { 
      provider: 'google', 
      type: 'ads',
      requiredScopes: ['https://www.googleapis.com/auth/adwords']
    },
    facebook_ads: { 
      provider: 'facebook', 
      type: 'ads',
      requiredScopes: ['ads_management', 'ads_read']
    },
    salesforce_crm: { 
      provider: 'salesforce', 
      type: 'crm',
      requiredScopes: ['api', 'refresh_token']
    },
    hubspot_crm: { 
      provider: 'hubspot', 
      type: 'crm',
      requiredScopes: ['contacts', 'content']
    },
    twitter_api: { 
      provider: 'twitter', 
      type: 'social',
      requiredScopes: ['tweet.read', 'tweet.write', 'users.read']
    },
    linkedin_marketing: { 
      provider: 'linkedin', 
      type: 'social',
      requiredScopes: ['r_emailaddress', 'w_organization_social']
    },
    instagram_api: { 
      provider: 'instagram', 
      type: 'social',
      requiredScopes: ['user_profile', 'user_media']
    },
    mailchimp_email: { 
      provider: 'mailchimp', 
      type: 'email',
      requiredScopes: []
    },
    shopify_store: { 
      provider: 'shopify', 
      type: 'erp',
      requiredScopes: ['read_products', 'write_products', 'read_orders']
    },
    stripe_payment: { 
      provider: 'stripe', 
      type: 'payment',
      requiredScopes: ['read_write']
    }
  };

  private constructor() {
    this.integrationConfigs = new Map();
    this.loadConfigFromEnvironment();
  }

  /**
   * Get the singleton instance of IntegrationService
   */
  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  /**
   * Load integration configuration from environment variables
   */
  private loadConfigFromEnvironment(): void {
    // Google Analytics
    if (process.env.ENABLE_GOOGLE_ANALYTICS === 'true') {
      this.integrationConfigs.set('google_analytics', {
        enabled: true,
        credentials: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/callback/google`,
        scopes: this.serviceInfo.google_analytics.requiredScopes
      });
    }

    // Google Ads
    if (process.env.ENABLE_GOOGLE_ADS === 'true') {
      this.integrationConfigs.set('google_ads', {
        enabled: true,
        credentials: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/callback/google`,
        scopes: this.serviceInfo.google_ads.requiredScopes,
        additionalConfig: {
          developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        }
      });
    }

    // Salesforce
    if (process.env.ENABLE_SALESFORCE === 'true') {
      this.integrationConfigs.set('salesforce_crm', {
        enabled: true,
        credentials: {
          clientId: process.env.SALESFORCE_CLIENT_ID,
          clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        },
        redirectUri: process.env.SALESFORCE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/callback/salesforce`,
        scopes: this.serviceInfo.salesforce_crm.requiredScopes
      });
    }

    // Facebook Ads
    if (process.env.ENABLE_FACEBOOK === 'true') {
      this.integrationConfigs.set('facebook_ads', {
        enabled: true,
        credentials: {
          clientId: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
        },
        redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/callback/facebook`,
        scopes: this.serviceInfo.facebook_ads.requiredScopes
      });
    }

    // Add similar config loading for other platforms...
  }

  /**
   * Check if a service is enabled in configuration
   * @param service The integration service to check
   */
  public isServiceEnabled(service: IntegrationService): boolean {
    const config = this.integrationConfigs.get(service);
    return config?.enabled === true;
  }

  /**
   * Get configuration for a specific service
   * @param service The integration service
   */
  public getServiceConfig(service: IntegrationService): IntegrationConfig | undefined {
    return this.integrationConfigs.get(service);
  }

  /**
   * Set configuration for a specific service
   * @param service The integration service
   * @param config The configuration to set
   */
  public setServiceConfig(service: IntegrationService, config: IntegrationConfig): void {
    this.integrationConfigs.set(service, config);
  }

  /**
   * Get authorization URL for a service
   * @param service The integration service
   * @param state Optional state parameter for OAuth
   */
  public getAuthorizationUrl(service: IntegrationService, state?: string): string {
    const config = this.getServiceConfig(service);
    if (!config || !config.enabled) {
      throw new Error(`Service ${service} is not enabled`);
    }

    const serviceInfo = this.serviceInfo[service];
    const providerConfig = this.providerOAuthConfig[serviceInfo.provider];
    
    // Add state to config if provided
    const configWithState = {
      ...config,
      additionalConfig: {
        ...config.additionalConfig,
        state: state || service
      }
    };

    return providerConfig.getAuthUrlFn(configWithState);
  }

  /**
   * Get tokens from authorization code
   * @param service The integration service
   * @param code The authorization code
   */
  public async getTokensFromCode(service: IntegrationService, code: string): Promise<any> {
    const config = this.getServiceConfig(service);
    if (!config || !config.enabled) {
      throw new Error(`Service ${service} is not enabled`);
    }

    const serviceInfo = this.serviceInfo[service];
    const providerConfig = this.providerOAuthConfig[serviceInfo.provider];
    
    return providerConfig.getTokensFn(code, config);
  }

  /**
   * Create an integration for a user
   * @param userId The user ID
   * @param service The integration service
   * @param tokens The OAuth tokens
   * @param accountId Optional account ID (for services like Ads accounts)
   */
  public async createIntegration(
    userId: number, 
    service: IntegrationService, 
    tokens: { accessToken: string, refreshToken?: string, expiryDate?: Date },
    accountId?: string
  ): Promise<Integration> {
    const serviceInfo = this.serviceInfo[service];
    
    const integration: InsertIntegration = {
      userId,
      service,
      provider: serviceInfo.provider,
      integrationType: serviceInfo.type,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
      tokenExpiry: tokens.expiryDate,
      accountId: accountId || null,
      status: 'connected',
      lastSynced: new Date(),
      config: null, // No additional config yet
      credentials: null // We don't store the original credentials here for security
    };

    return storage.createIntegration(integration);
  }

  /**
   * Update an existing integration
   * @param id The integration ID
   * @param updates The fields to update
   */
  public async updateIntegration(id: number, updates: Partial<Integration>): Promise<Integration> {
    return storage.updateIntegration(id, updates);
  }

  /**
   * Refresh access token for an integration
   * @param integration The integration to refresh
   */
  public async refreshAccessToken(integration: Integration): Promise<Integration> {
    if (!integration.refreshToken) {
      throw new Error('No refresh token available for this integration');
    }

    const serviceInfo = this.serviceInfo[integration.service as IntegrationService];
    const config = this.getServiceConfig(integration.service as IntegrationService);
    
    if (!config) {
      throw new Error(`Service ${integration.service} is not configured`);
    }

    try {
      let newTokens: any;

      // Google-specific refresh token logic
      if (serviceInfo.provider === 'google') {
        const oauth2Client = new google.auth.OAuth2(
          config.credentials?.clientId,
          config.credentials?.clientSecret,
          config.redirectUri
        );
        
        oauth2Client.setCredentials({
          refresh_token: integration.refreshToken
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        
        newTokens = {
          accessToken: credentials.access_token,
          expiryDate: new Date(Date.now() + (credentials.expiry_date || 3600 * 1000))
        };
      } else {
        // Generic OAuth2 refresh logic for other providers
        const tokenUrl = this.providerOAuthConfig[serviceInfo.provider].tokenUrl;
        
        const response = await axios.post(tokenUrl, {
          client_id: config.credentials?.clientId,
          client_secret: config.credentials?.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: integration.refreshToken
        });

        const expiresIn = response.data.expires_in || 3600;
        
        newTokens = {
          accessToken: response.data.access_token,
          expiryDate: new Date(Date.now() + expiresIn * 1000)
        };
      }

      // Update the integration with new tokens
      return this.updateIntegration(integration.id, {
        accessToken: newTokens.accessToken,
        tokenExpiry: newTokens.expiryDate,
        lastSynced: new Date()
      });
    } catch (error) {
      console.error(`Failed to refresh token for ${integration.service}:`, error);
      
      // Mark integration as disconnected
      await this.updateIntegration(integration.id, {
        status: 'disconnected'
      });
      
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Check if an integration token is expired and refresh if needed
   * @param integration The integration to check
   */
  public async ensureValidToken(integration: Integration): Promise<Integration> {
    // Check if token is expired or about to expire (within 5 minutes)
    const tokenExpiry = integration.tokenExpiry ? new Date(integration.tokenExpiry) : null;
    const isExpired = tokenExpiry ? tokenExpiry < new Date(Date.now() + 5 * 60 * 1000) : false;
    
    if (isExpired && integration.refreshToken) {
      return this.refreshAccessToken(integration);
    }
    
    return integration;
  }

  // OAuth URL generators for different providers
  private getGoogleAuthUrl(config: IntegrationConfig): string {
    const oauth2Client = new google.auth.OAuth2(
      config.credentials?.clientId,
      config.credentials?.clientSecret,
      config.redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.scopes,
      prompt: 'consent', // Force consent to get refresh token
      state: config.additionalConfig?.state
    });
  }

  private async getGoogleTokens(code: string, config: IntegrationConfig): Promise<any> {
    const oauth2Client = new google.auth.OAuth2(
      config.credentials?.clientId,
      config.credentials?.clientSecret,
      config.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    };
  }

  // Facebook OAuth URL generator
  private getFacebookAuthUrl(config: IntegrationConfig): string {
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(',') || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.facebook.authUrl}?${params.toString()}`;
  }

  private async getFacebookTokens(code: string, config: IntegrationConfig): Promise<any> {
    try {
      const response = await axios.get(this.providerOAuthConfig.facebook.tokenUrl, {
        params: {
          client_id: config.credentials?.clientId,
          client_secret: config.credentials?.clientSecret,
          redirect_uri: config.redirectUri,
          code
        }
      });

      // Calculate expiry date (Facebook usually gives token_expires_in in seconds)
      const expiryDate = response.data.expires_in 
        ? new Date(Date.now() + (response.data.expires_in * 1000)) 
        : null;

      return {
        accessToken: response.data.access_token,
        refreshToken: null, // Facebook doesn't use refresh tokens in the same way
        expiryDate
      };
    } catch (error) {
      console.error('Error getting Facebook tokens:', error);
      throw new Error('Failed to get Facebook access token');
    }
  }

  // Other OAuth URL generators (implementations would be similar to above)
  private getTwitterAuthUrl(config: IntegrationConfig): string {
    // Twitter OAuth 2.0 implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code',
      code_challenge_method: 'S256',
      code_challenge: config.additionalConfig?.codeChallenge || ''
    });

    return `${this.providerOAuthConfig.twitter.authUrl}?${params.toString()}`;
  }

  private async getTwitterTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Twitter token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getLinkedInAuthUrl(config: IntegrationConfig): string {
    // LinkedIn OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.linkedin.authUrl}?${params.toString()}`;
  }

  private async getLinkedInTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for LinkedIn token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getSalesforceAuthUrl(config: IntegrationConfig): string {
    // Salesforce OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.salesforce.authUrl}?${params.toString()}`;
  }

  private async getSalesforceTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Salesforce token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getHubSpotAuthUrl(config: IntegrationConfig): string {
    // HubSpot OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.hubspot.authUrl}?${params.toString()}`;
  }

  private async getHubSpotTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for HubSpot token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getMailchimpAuthUrl(config: IntegrationConfig): string {
    // Mailchimp OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.mailchimp.authUrl}?${params.toString()}`;
  }

  private async getMailchimpTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Mailchimp token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getShopifyAuthUrl(config: IntegrationConfig): string {
    // Shopify OAuth implementation
    const shop = config.additionalConfig?.shop || '';
    const authUrl = this.providerOAuthConfig.shopify.authUrl.replace('{shop}', shop);
    
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      scope: config.scopes?.join(',') || '',
      state: config.additionalConfig?.state || ''
    });

    return `${authUrl}?${params.toString()}`;
  }

  private async getShopifyTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Shopify token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getInstagramAuthUrl(config: IntegrationConfig): string {
    // Instagram OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code',
      state: config.additionalConfig?.state || ''
    });

    return `${this.providerOAuthConfig.instagram.authUrl}?${params.toString()}`;
  }

  private async getInstagramTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Instagram token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }

  private getStripeAuthUrl(config: IntegrationConfig): string {
    // Stripe OAuth implementation
    const params = new URLSearchParams({
      client_id: config.credentials?.clientId || '',
      redirect_uri: config.redirectUri || '',
      state: config.additionalConfig?.state || '',
      scope: config.scopes?.join(' ') || '',
      response_type: 'code'
    });

    return `${this.providerOAuthConfig.stripe.authUrl}?${params.toString()}`;
  }

  private async getStripeTokens(code: string, config: IntegrationConfig): Promise<any> {
    // Implementation for Stripe token exchange
    return { accessToken: '', refreshToken: '', expiryDate: null };
  }
}

// Export the singleton instance
export const integrationService = IntegrationService.getInstance();