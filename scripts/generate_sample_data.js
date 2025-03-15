#!/usr/bin/env node

/**
 * This script generates sample marketing analytics data for demonstration purposes
 * and uploads it to a Google Cloud Storage bucket.
 * 
 * Prerequisites:
 * - Google Cloud SDK installed and configured
 * - Permissions to write to the GCS bucket
 * - Node.js 14+ installed
 * 
 * Usage:
 * node generate_sample_data.js --bucket=YOUR_BUCKET_NAME [--days=90] [--campaigns=5]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let bucketName = null;
let daysOfData = 90;
let numCampaigns = 5;

args.forEach(arg => {
  if (arg.startsWith('--bucket=')) {
    bucketName = arg.replace('--bucket=', '');
  } else if (arg.startsWith('--days=')) {
    daysOfData = parseInt(arg.replace('--days=', ''), 10);
  } else if (arg.startsWith('--campaigns=')) {
    numCampaigns = parseInt(arg.replace('--campaigns=', ''), 10);
  }
});

if (!bucketName) {
  console.error('Error: Bucket name is required. Use --bucket=YOUR_BUCKET_NAME');
  process.exit(1);
}

// Create temp directory for data files
const tempDir = path.join(__dirname, 'temp_data');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Campaign data
const campaigns = [];
for (let i = 1; i <= numCampaigns; i++) {
  campaigns.push({
    id: `campaign-${i}`,
    name: generateCampaignName(i),
    platform: randomChoice(['Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter']),
    budget: Math.floor(Math.random() * 10000) + 1000, // Budget between $1000-$11000
    status: randomChoice(['active', 'paused', 'completed'])
  });
}

// Content types
const contentTypes = [
  'blog post', 'social media post', 'email newsletter', 
  'video', 'infographic', 'white paper', 'case study'
];

// Generate marketing metrics data
console.log('Generating marketing metrics data...');
const marketingMetricsFile = path.join(tempDir, 'marketing_metrics.jsonl');

let marketingMetricsStream = fs.createWriteStream(marketingMetricsFile);

// Generate data for each day
const today = new Date();
for (let i = 0; i < daysOfData; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = formatDate(date);
  
  // Data for each campaign
  campaigns.forEach(campaign => {
    // Basic metrics with some random fluctuation
    const baseFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
    
    // Impressions between 500-5000 with daily variation
    const impressions = Math.floor((Math.random() * 4500 + 500) * baseFactor);
    
    // CTR between 1-8%
    const ctr = (Math.random() * 7 + 1) / 100;
    const clicks = Math.floor(impressions * ctr);
    
    // CPC between $0.50-$2.50
    const cpc = Math.random() * 2 + 0.5;
    const cost = parseFloat((clicks * cpc).toFixed(2));
    
    // Conversion rate between 2-10%
    const conversionRate = (Math.random() * 8 + 2) / 100;
    const conversions = Math.floor(clicks * conversionRate);
    
    // Average conversion value between $10-$100
    const avgConversionValue = Math.random() * 90 + 10;
    const conversionValue = parseFloat((conversions * avgConversionValue).toFixed(2));
    
    // ROAS
    const roas = cost > 0 ? parseFloat((conversionValue / cost).toFixed(2)) : 0;
    
    const metrics = {
      date: dateStr,
      platform: campaign.platform,
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      impressions,
      clicks,
      cost,
      conversions,
      conversion_value: conversionValue,
      ctr: parseFloat(ctr.toFixed(4)),
      cpc: parseFloat(cpc.toFixed(2)),
      roas
    };
    
    marketingMetricsStream.write(JSON.stringify(metrics) + '\n');
  });
}

marketingMetricsStream.end();
console.log(`✅ Generated marketing metrics data: ${marketingMetricsFile}`);

// Generate content performance data
console.log('Generating content performance data...');
const contentFile = path.join(tempDir, 'content_performance.jsonl');
let contentStream = fs.createWriteStream(contentFile);

// Generate sample content items (one per week per platform)
const contentItems = [];
const platforms = ['Website Blog', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube'];

// Create approximately 1 content item per week per platform
const weeksOfData = Math.ceil(daysOfData / 7);
for (let week = 0; week < weeksOfData; week++) {
  platforms.forEach((platform, pIndex) => {
    contentItems.push({
      id: `content-${week}-${pIndex}`,
      title: generateContentTitle(platform, week),
      type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      platform,
      week
    });
  });
}

// Generate daily performance for each content item
for (let i = 0; i < daysOfData; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = formatDate(date);
  const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
  
  // For each content item that's been published by this date
  contentItems.forEach(content => {
    const contentWeekInPast = weeksOfData - content.week - 1;
    const contentPublishDate = new Date(today);
    contentPublishDate.setDate(contentPublishDate.getDate() - (contentWeekInPast * 7 + dayOfWeek));
    
    // Skip if the content hasn't been published yet
    if (date < contentPublishDate) {
      return;
    }
    
    // Calculate age factor - content gets less engagement over time
    const ageInDays = Math.floor((date - contentPublishDate) / (1000 * 60 * 60 * 24));
    const ageFactor = Math.max(0.1, 1 - ageInDays / 30); // Diminish to 10% after a month
    
    // Platform factor - different platforms get different engagement levels
    const platformFactors = {
      'Website Blog': { views: 5, engagement: 0.5 },
      'Facebook': { views: 8, engagement: 1.2 },
      'Instagram': { views: 10, engagement: 1.5 },
      'LinkedIn': { views: 3, engagement: 0.8 },
      'Twitter': { views: 7, engagement: 1.0 },
      'YouTube': { views: 4, engagement: 1.3 }
    };
    
    const platformFactor = platformFactors[content.platform];
    
    // Base views between 50-500 depending on platform
    const baseViews = Math.floor((Math.random() * 450 + 50) * platformFactor.views);
    const views = Math.floor(baseViews * ageFactor);
    
    // Engagement metrics
    const likesRate = Math.random() * 0.1 + 0.05; // 5-15%
    const likes = Math.floor(views * likesRate * platformFactor.engagement);
    
    const shareRate = Math.random() * 0.03 + 0.01; // 1-4%
    const shares = Math.floor(views * shareRate * platformFactor.engagement);
    
    const commentRate = Math.random() * 0.02 + 0.005; // 0.5-2.5%
    const comments = Math.floor(views * commentRate * platformFactor.engagement);
    
    const clickRate = Math.random() * 0.08 + 0.02; // 2-10%
    const clicks = Math.floor(views * clickRate);
    
    const conversionRate = Math.random() * 0.02 + 0.005; // 0.5-2.5%
    const conversions = Math.floor(clicks * conversionRate);
    
    const engagementRate = parseFloat(((likes + shares + comments) / views).toFixed(4));
    
    const performance = {
      date: dateStr,
      content_id: content.id,
      content_title: content.title,
      content_type: content.type,
      platform: content.platform,
      views,
      likes,
      shares,
      comments,
      clicks,
      conversions,
      engagement_rate: engagementRate
    };
    
    contentStream.write(JSON.stringify(performance) + '\n');
  });
}

contentStream.end();
console.log(`✅ Generated content performance data: ${contentFile}`);

// Upload files to GCS
console.log(`\nUploading data to GCS bucket: ${bucketName}`);

try {
  // Marketing metrics data
  console.log('Uploading marketing metrics data...');
  execSync(`gsutil cp ${marketingMetricsFile} gs://${bucketName}/data/marketing_metrics/`);
  
  // Content performance data
  console.log('Uploading content performance data...');
  execSync(`gsutil cp ${contentFile} gs://${bucketName}/data/content_performance/`);
  
  console.log('\n✅ All data files uploaded successfully!');
  console.log(`\nTo load this data into BigQuery, run:`);
  console.log(`bq load --source_format=NEWLINE_DELIMITED_JSON marketing_analytics.marketing_metrics gs://${bucketName}/data/marketing_metrics/marketing_metrics.jsonl ./marketing_metrics_schema.json`);
  console.log(`bq load --source_format=NEWLINE_DELIMITED_JSON marketing_analytics.content_performance gs://${bucketName}/data/content_performance/content_performance.jsonl ./content_performance_schema.json`);
} catch (error) {
  console.error('Error uploading files to GCS:', error.message);
  console.log('Make sure you have the gsutil tool installed and proper permissions to the bucket.');
}

// Clean up temporary files
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
  console.log('\nTemporary files cleaned up.');
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCampaignName(id) {
  const adjectives = ['Summer', 'Winter', 'Spring', 'Fall', 'Holiday', 'Black Friday', 'Year-End', 'Back-to-School', 'Product Launch', 'Grand Opening'];
  const nouns = ['Sale', 'Promotion', 'Campaign', 'Special', 'Event', 'Showcase', 'Extravaganza', 'Blowout', 'Awareness', 'Initiative'];
  return `${randomChoice(adjectives)} ${randomChoice(nouns)} ${new Date().getFullYear()}`;
}

function generateContentTitle(platform, week) {
  const titlePrefixes = [
    'Top 10 Ways to', 'How to', 'The Ultimate Guide to', 
    'Why You Should', '5 Tips for', 'The Future of',
    'Understanding', 'Mastering', 'Exploring', 'A Complete Guide to'
  ];
  
  const titleTopics = [
    'Digital Marketing', 'Social Media', 'Content Creation',
    'SEO Strategies', 'Email Campaigns', 'Brand Building',
    'Customer Engagement', 'Conversion Optimization', 'Data Analytics',
    'Marketing Automation', 'Video Marketing', 'Influencer Partnerships'
  ];
  
  return `${randomChoice(titlePrefixes)} ${randomChoice(titleTopics)} (${platform} Week ${week + 1})`;
}