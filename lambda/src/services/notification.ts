import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { CONFIG } from '../config/index.js';
import { ProcessedPost } from '../types/index.js';

// Shared client instance
const snsClient = new SNSClient({ region: CONFIG.AWS_REGION });

/**
 * Send notification via SNS for high-quality DD posts
 */
export async function sendNotification(post: ProcessedPost): Promise<void> {
    try {
        if (!CONFIG.SNS_TOPIC_ARN) {
            console.log('SNS topic not configured, skipping notification');
            return;
        }

        const subject = `[DD Alert] ${post.title} - Score: ${post.llmEvaluation.qualityScore}`;
        const message = `
New high-quality DD post detected!

Title: ${post.title}
Score: ${post.llmEvaluation.qualityScore}/10
Summary: ${post.llmEvaluation.summary}
Post ID: ${post.id}

Content Preview: ${post.selftext.substring(0, CONFIG.MAX_PREVIEW_LENGTH)}...
        `.trim();

        const command = new PublishCommand({
            TopicArn: CONFIG.SNS_TOPIC_ARN,
            Subject: subject,
            Message: message
        });
        
        await snsClient.send(command);
        console.log(`Sent notification for post ${post.id}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

/**
 * Check if a post meets the quality threshold for notification
 */
export function shouldSendNotification(qualityScore: number): boolean {
    return qualityScore > CONFIG.QUALITY_THRESHOLD;
} 