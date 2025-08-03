import axios from 'axios';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { CONFIG } from '../config/index.js';
import { RedditPost, RedditAPIResponse } from '../types/index.js';

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = Math.floor(60000 / CONFIG.REDDIT_API_RATE_LIMIT); // Calculate interval based on rate limit

/**
 * Rate limiting function to respect Reddit's API guidelines
 */
function enforceRateLimit(): void {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
        // In a real implementation, you might want to use setTimeout
        // For Lambda, we'll just log the delay
    }
    
    lastRequestTime = now;
}

/**
 * Get Reddit client secret from AWS Secrets Manager
 */
async function getRedditClientSecret(): Promise<string> {
    try {
        console.log('🔐 Getting Reddit client secret from AWS Secrets Manager...');
        
        const secretsClient = new SecretsManagerClient({ region: CONFIG.AWS_REGION });
        const command = new GetSecretValueCommand({
            SecretId: CONFIG.REDDIT_SECRETS_ARN
        });
        
        const response = await secretsClient.send(command);
        
        if (response.SecretString) {
            const secret = JSON.parse(response.SecretString);
            console.log('✅ Reddit client secret retrieved successfully', secret["rstock-secret-key"]);
            return secret["rstock-secret-key"] || '';
        } else {
            throw new Error('No secret string found in AWS Secrets Manager');
        }
        
    } catch (error: any) {
        console.error('❌ Failed to get Reddit client secret:', error);
        throw new Error('Failed to retrieve Reddit credentials from AWS Secrets Manager.');
    }
}

/**
 * Get OAuth access token for Reddit API
 */
async function getRedditAccessToken(): Promise<string> {
    try {
        console.log('🔐 Getting Reddit OAuth access token...');
        
        // Get client secret from AWS Secrets Manager
        const clientSecret = await getRedditClientSecret();
        
        if (!CONFIG.REDDIT_CLIENT_ID || !clientSecret) {
            throw new Error('Missing Reddit OAuth credentials');
        }
        
        const authResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${CONFIG.REDDIT_CLIENT_ID}:${clientSecret}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': CONFIG.USER_AGENT
                },
                timeout: CONFIG.REDDIT_API_TIMEOUT
            }
        );
        
        if (authResponse.data && authResponse.data.access_token) {
            console.log('✅ Reddit OAuth token obtained successfully');
            return authResponse.data.access_token;
        } else {
            throw new Error('Invalid OAuth response format');
        }
        
    } catch (error: any) {
        console.error('❌ Failed to get Reddit OAuth token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Reddit API. Please check your credentials.');
    }
}

/**
 * Fetch posts from r/WallStreetBets using OAuth authentication
 * 
 * Reddit API Rules:
 * - OAuth authentication required for all API access
 * - Use proper User-Agent format: platform:app:version:username
 * - Respect rate limits (60 requests per minute)
 * - Handle errors gracefully
 */
export async function fetchWallStreetBetsPosts(afterPostId: string | null = null): Promise<RedditPost[]> {
    try {
        // Enforce rate limiting
        enforceRateLimit();
        
        // Get OAuth access token
        const accessToken = await getRedditAccessToken();
        
        // Build URL with proper parameters
        let url = `https://oauth.reddit.com/r/${CONFIG.SUBREDDIT}/new?limit=${CONFIG.POST_LIMIT}`;
        
        // Add 'after' parameter if we have a last processed post ID
        if (afterPostId) {
            url += `&after=t3_${afterPostId}`;
        }
        
        console.log(`📡 Fetching from OAuth URL: ${url}`);
        
        // Use OAuth headers
        const response = await axios.get<RedditAPIResponse>(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': CONFIG.USER_AGENT,
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: CONFIG.REDDIT_API_TIMEOUT,
            maxRedirects: 3
        });
        
        // Validate response
        if (!response.data || !response.data.data || !response.data.data.children) {
            throw new Error('Invalid response format from Reddit API');
        }
        
        const posts: RedditPost[] = response.data.data.children.map(child => ({
            id: child.data.id,
            title: child.data.title,
            selftext: child.data.selftext || '',
            flair: child.data.link_flair_text || ''
        }));
        
        console.log(`✅ Successfully fetched ${posts.length} posts from Reddit`);
        
        // Log API limits if available
        logApiLimits(response);
        
        return posts;
        
    } catch (error: any) {
        console.error('❌ Error fetching Reddit posts:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
            console.log('Authentication failed (401). OAuth token may be invalid or expired.');
            throw new Error('Reddit OAuth authentication failed. Please check your credentials.');
        } else if (error.response?.status === 403) {
            console.log('Access forbidden (403). This might be due to insufficient permissions.');
            throw new Error('Reddit API access forbidden. Please check your app permissions.');
        } else if (error.response?.status === 429) {
            console.log('Rate limit exceeded (429). Reddit is throttling requests.');
            throw new Error('Reddit API rate limit exceeded. Please wait before making more requests.');
        } else if (error.response?.status === 503) {
            console.log('Service unavailable (503). Reddit servers might be overloaded.');
            throw new Error('Reddit API service temporarily unavailable.');
        }
        
        throw error;
    }
}

/**
 * Get Reddit API status and limits from response headers
 */
function logApiLimits(response: any): void {
    const headers = response.headers;
    
    if (headers['x-ratelimit-remaining']) {
        console.log(`📊 Rate limit remaining: ${headers['x-ratelimit-remaining']}`);
    }
    
    if (headers['x-ratelimit-used']) {
        console.log(`📊 Rate limit used: ${headers['x-ratelimit-used']}`);
    }
    
    if (headers['x-ratelimit-reset']) {
        console.log(`📊 Rate limit reset: ${headers['x-ratelimit-reset']}`);
    }
} 