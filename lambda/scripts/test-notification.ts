#!/usr/bin/env node
import { sendNotification, shouldSendNotification } from '../src/services/notification.js';
import { ProcessedPost } from '../src/types/index.js';

async function testNotification() {
    console.log('🧪 Testing Notification (SNS) Functions...\n');
    
    try {
        // Test notification threshold logic
        console.log('🎯 Testing notification threshold logic...');
        const highQualityScore = 8.5;
        const lowQualityScore = 5.0;
        
        console.log(`   Score ${highQualityScore}: Should notify = ${shouldSendNotification(highQualityScore)}`);
        console.log(`   Score ${lowQualityScore}: Should notify = ${shouldSendNotification(lowQualityScore)}`);
        console.log('');
        
        // Test sending notification
        const mockProcessedPost: ProcessedPost = {
            id: 'test123',
            title: '[DD] Test Stock Analysis - High Quality DD',
            selftext: `This is a comprehensive test DD post for notification testing. It includes detailed analysis of fundamentals, technical indicators, and market conditions. The post demonstrates high-quality research and analysis that would typically trigger a notification.

**Key Points:**
- Strong fundamental analysis
- Clear technical indicators
- Well-structured arguments
- Comprehensive risk assessment

This post should meet the quality threshold for notifications.`,
            flair: 'DD',
            llmEvaluation: {
                qualityScore: 8.5,
                summary: 'High-quality DD with comprehensive analysis',
                reasoning: 'Well-structured analysis with clear fundamentals and technical indicators'
            }
        };
        
        console.log('📧 Testing sendNotification...');
        console.log('   Post Title:', mockProcessedPost.title);
        console.log('   Quality Score:', mockProcessedPost.llmEvaluation.qualityScore);
        console.log('   Should Notify:', shouldSendNotification(mockProcessedPost.llmEvaluation.qualityScore));
        
        await sendNotification(mockProcessedPost);
        console.log('   ✅ Notification sent successfully!\n');
        
        console.log('🎉 All notification tests passed!');
        console.log('\n📋 Check your email for the test notification');
        
    } catch (error) {
        console.error('❌ Notification test failed:', error);
        console.log('\n💡 Make sure you have:');
        console.log('   - AWS credentials configured');
        console.log('   - SNS_TOPIC_ARN environment variable set');
        console.log('   - Proper IAM permissions for SNS');
        console.log('   - Email subscribed to SNS topic');
        process.exit(1);
    }
}

testNotification(); 