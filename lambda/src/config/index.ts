// Configuration constants for the Reddit Stock Screener Lambda

export const CONFIG = {
    // Reddit API configuration
    SUBREDDIT: 'wallstreetbets',
    POST_LIMIT: 100,
    USER_AGENT: 'StockScreenerBot/1.0 (by /u/mopogos)',
    
    // AWS configuration
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    
    // S3 configuration
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_STATE_KEY: 'state/last-processed-post.json',
    S3_ARCHIVE_PREFIX: 'archive/dd_',
    
    // SNS configuration
    SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
    
    // LLM configuration
    QUALITY_THRESHOLD: parseInt(process.env.QUALITY_THRESHOLD || '7'),
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    
    // Pagination
    LAST_PROCESSED_POST_ID: process.env.LAST_PROCESSED_POST_ID,
    
    // DD filtering configuration
    DD_KEYWORDS: [
        'dd', 'due diligence', 'analysis', 'research', 'fundamental',
        'technical analysis', 'ta', 'fundamentals', 'valuation',
        'earnings', 'financials', 'balance sheet', 'income statement',
        'cash flow', 'pe ratio', 'market cap', 'revenue', 'profit',
        'stock analysis', 'company analysis', 'investment thesis',
        'bullish', 'bearish', 'price target', 'catalyst'
    ],
    
    // Content analysis thresholds
    MIN_TEXT_LENGTH: 200,
    MAX_CONTENT_LENGTH: 2000,
    MAX_PREVIEW_LENGTH: 500
} as const; 