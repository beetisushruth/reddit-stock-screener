#!/usr/bin/env node

import { SNSClient, CreateTopicCommand, SubscribeCommand, ListSubscriptionsByTopicCommand } from '@aws-sdk/client-sns';
import { CONFIG } from '../src/config/index.js';

const snsClient = new SNSClient({ region: CONFIG.AWS_REGION });

async function setupSNS() {
    try {
        console.log('Setting up SNS topic and email subscription...');
        
        // Create SNS topic
        const createTopicCommand = new CreateTopicCommand({
            Name: 'dd-notifications'
        });
        
        const topicResponse = await snsClient.send(createTopicCommand);
        const topicArn = topicResponse.TopicArn;
        
        console.log(`✅ Created SNS topic: ${topicArn}`);
        
        // Subscribe email if provided
        if (CONFIG.NOTIFICATION_EMAIL) {
            const subscribeCommand = new SubscribeCommand({
                TopicArn: topicArn,
                Protocol: 'email',
                Endpoint: CONFIG.NOTIFICATION_EMAIL
            });
            
            await snsClient.send(subscribeCommand);
            console.log(`✅ Subscribed ${CONFIG.NOTIFICATION_EMAIL} to topic`);
            console.log(`📧 Check your email and click the confirmation link!`);
        } else {
            console.log('⚠️  No NOTIFICATION_EMAIL configured. Set it in your environment variables.');
        }
        
        console.log('\n📋 Next steps:');
        console.log('1. Set SNS_TOPIC_ARN environment variable to:', topicArn);
        console.log('2. Check your email and confirm the subscription');
        console.log('3. Deploy your Lambda function');
        
    } catch (error) {
        console.error('❌ Error setting up SNS:', error);
    }
}

setupSNS(); 