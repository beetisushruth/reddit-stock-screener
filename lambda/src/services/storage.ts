import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { CONFIG } from '../config/index.js';
import { ProcessedPost, StateData } from '../types/index.js';

// Shared client instance
const s3Client = new S3Client({ region: CONFIG.AWS_REGION });

/**
 * Get the last processed post ID from S3 or environment
 */
export async function getLastProcessedPostId(): Promise<string | null> {
    try {
        // First try to get from environment variable (for backward compatibility)
        if (CONFIG.LAST_PROCESSED_POST_ID) {
            return CONFIG.LAST_PROCESSED_POST_ID;
        }
        
        // Try to get from S3 if bucket is configured
        if (CONFIG.S3_BUCKET_NAME) {
            try {
                const command = new GetObjectCommand({
                    Bucket: CONFIG.S3_BUCKET_NAME,
                    Key: CONFIG.S3_STATE_KEY
                });
                
                const response = await s3Client.send(command);
                const body = await response.Body?.transformToString();
                if (body) {
                    const data = JSON.parse(body) as StateData;
                    console.log(`Retrieved last processed post ID from S3: ${data.lastProcessedPostId}`);
                    return data.lastProcessedPostId;
                }
            } catch (error: any) {
                if (error.name === 'NoSuchKey') {
                    console.log('No previous state found in S3, starting fresh');
                    return null;
                }
                console.error('Error reading from S3:', error);
                return null;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting last processed post ID:', error);
        return null;
    }
}

/**
 * Store the last processed post ID to S3
 */
export async function storeLastProcessedPostId(postId: string): Promise<void> {
    try {
        if (CONFIG.S3_BUCKET_NAME) {
            const command = new PutObjectCommand({
                Bucket: CONFIG.S3_BUCKET_NAME,
                Key: CONFIG.S3_STATE_KEY,
                Body: JSON.stringify({
                    lastProcessedPostId: postId,
                    timestamp: new Date().toISOString()
                } as StateData),
                ContentType: 'application/json'
            });
            
            await s3Client.send(command);
            console.log(`Stored last processed post ID to S3: ${postId}`);
        } else {
            console.log(`Last processed post ID (not stored): ${postId}`);
        }
    } catch (error) {
        console.error('Error storing last processed post ID:', error);
    }
}

/**
 * Store post to S3 for archiving
 */
export async function storeToS3(post: ProcessedPost): Promise<void> {
    try {
        if (!CONFIG.S3_BUCKET_NAME) {
            console.log('S3 bucket not configured, skipping archive');
            return;
        }

        const timestamp = new Date().toISOString();
        const key = `${CONFIG.S3_ARCHIVE_PREFIX}${post.id}_${timestamp}.json`;
        
        const command = new PutObjectCommand({
            Bucket: CONFIG.S3_BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(post, null, 2),
            ContentType: 'application/json'
        });
        
        await s3Client.send(command);
        console.log(`Stored post ${post.id} to S3: ${key}`);
    } catch (error) {
        console.error('Error storing to S3:', error);
    }
} 