# Reddit Stock Screener Lambda

This AWS Lambda function scrapes r/WallStreetBets for new posts, identifies DD (Due Diligence) content, evaluates them with Amazon Bedrock LLM, and sends notifications for high-quality posts.

## Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Modular Architecture**: Clean separation of concerns with dedicated services
- **Reddit API Integration**: Fetches latest posts from r/WallStreetBets
- **Pagination Support**: Uses Reddit's `after` parameter to avoid duplicate processing
- **DD Post Filtering**: Identifies DD content using keywords, flair, and patterns
- **LLM Evaluation**: Uses Amazon Bedrock to evaluate post quality
- **S3 Archiving**: Stores processed posts for audit trail
- **State Management**: Tracks last processed post ID in S3 for continuity
- **SNS Notifications**: Sends alerts for high-quality DD posts
- **AWS SDK v3**: Native AWS service integration

## Setup Instructions

### 1. AWS Lambda Setup
1. Create a new Lambda function
2. Set runtime to Node.js 18.x or later
3. Set timeout to 30 seconds
4. Set memory to 512 MB (increased for LLM processing)

### 2. Environment Variables
Set these environment variables in your Lambda function:
- `AWS_REGION`: AWS region (default: us-east-1)
- `S3_BUCKET_NAME`: S3 bucket for archiving and state management (required for pagination)
- `SNS_TOPIC_ARN`: SNS topic for notifications (optional)
- `NOTIFICATION_EMAIL`: Email address to receive notifications (optional)
- `QUALITY_THRESHOLD`: Minimum score for notifications (default: 7.0)
- `BEDROCK_MODEL_ID`: Bedrock model to use (default: Claude 3 Sonnet)
- `LAST_PROCESSED_POST_ID`: Initial post ID to start from (optional, will be auto-managed)

**Note**: No Reddit credentials required! The function uses Reddit's public API.

### 3. IAM Permissions
Attach the IAM policy from `iam-policy.json` to your Lambda execution role. This includes:
- CloudWatch Logs permissions
- S3 read/write permissions
- SNS publish permissions
- Bedrock invoke permissions

### 4. AWS Services Setup

#### S3 Bucket (Optional)
```bash
aws s3 mb s3://dd-posts-bucket
```

#### SNS Topic and Email Subscription
```bash
# Option 1: Use the setup script (recommended)
export NOTIFICATION_EMAIL=your-email@example.com
node scripts/setup-sns.js

# Option 2: Manual setup
aws sns create-topic --name dd-notifications
aws sns subscribe --topic-arn arn:aws:sns:region:account:dd-notifications --protocol email --notification-endpoint your-email@example.com
```

**Important**: After subscribing, check your email and click the confirmation link!

#### Amazon Bedrock Access
Ensure your AWS account has access to Amazon Bedrock and the Claude model.

### 5. Development
```bash
cd lambda
pnpm install
pnpm run dev  # Watch mode for development
```

### 6. Deployment
```bash
cd lambda
pnpm install
pnpm run package  # Builds TypeScript and creates deployment package
aws lambda update-function-code --function-name YOUR_FUNCTION_NAME --zip-file fileb://function.zip
```

### 7. Testing
Test the function with an empty event:
```json
{}
```

## Architecture

```
Reddit API → Lambda → Bedrock LLM → S3/SNS
```

### Service Modules:
- **Reddit Functions**: Handle Reddit API interactions
- **DD Filter Functions**: Identify DD posts using multiple criteria
- **LLM Functions**: Evaluate posts using Amazon Bedrock
- **Storage Functions**: Manage S3 operations for state and archiving
- **Notification Functions**: Handle SNS notifications

### Flow:
1. **State Retrieval**: Gets last processed post ID from S3
2. **Reddit Scraping**: Fetches new posts after the last processed post
3. **DD Filtering**: Identifies DD posts using multiple criteria
4. **LLM Evaluation**: Each DD post is evaluated by Claude for quality
5. **Storage**: High-quality posts are archived to S3
6. **State Update**: Stores new last processed post ID
7. **Notifications**: Posts above threshold trigger SNS alerts

## Response Format

```json
{
  "statusCode": 200,
  "body": {
    "totalPosts": 25,
    "ddPosts": 3,
    "processedPosts": 3,
    "posts": [...],
    "ddPosts": [...],
    "processedPosts": [
      {
        "id": "post_id",
        "title": "Post Title",
        "llmEvaluation": {
          "qualityScore": 8.5,
          "summary": "Solid analysis...",
          "reasoning": "Well-researched..."
        }
      }
    ]
  }
}
```

## Cost Optimization

- **Lambda**: ~$0.20 per million requests
- **Bedrock**: ~$0.003 per 1K input tokens
- **S3**: ~$0.023 per GB stored
- **SNS**: ~$0.50 per million notifications

## Next Steps

This function can be extended to:
- Add more sophisticated DD detection algorithms
- Implement sentiment analysis
- Add stock ticker extraction
- Create a web dashboard for results
- Add retry logic for failed API calls
- Implement caching to avoid duplicate processing 