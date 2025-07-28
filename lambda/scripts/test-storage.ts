#!/usr/bin/env node
import { getLastProcessedPostId, storeLastProcessedPostId, storeToS3 } from '../src/services/storage.js';
import { ProcessedPost } from '../src/types/index.js';

async function testStorage() {
    console.log('🧪 Testing Storage (S3) Functions...\n');
    
    try {
        // Test getting last processed post ID
        console.log('📥 Testing getLastProcessedPostId...');
        const lastId = await getLastProcessedPostId();
        console.log(`   Current last processed post ID: ${lastId || 'None'}\n`);
        
        // Test storing a new last processed post ID
        const testPostId = 'test_post_123';
        console.log(`💾 Testing storeLastProcessedPostId with ID: ${testPostId}`);
        await storeLastProcessedPostId(testPostId);
        console.log('   ✅ Successfully stored last processed post ID\n');
        
        // Verify it was stored
        console.log('📥 Verifying stored ID...');
        const retrievedId = await getLastProcessedPostId();
        console.log(`   Retrieved ID: ${retrievedId}\n`);
        
        // Test storing a processed post to S3
        const mockProcessedPost: ProcessedPost = {
            id: 'test123',
            title: '[DD] Test Stock Analysis',
            selftext: 'This is a test DD post for storage testing.',
            flair: 'DD',
            llmEvaluation: {
                qualityScore: 8.5,
                summary: 'High-quality analysis with good fundamentals',
                reasoning: 'Comprehensive analysis with clear structure and data'
            }
        };
        
        console.log('📦 Testing storeToS3 with mock processed post...');
        console.log('   Post ID:', mockProcessedPost.id);
        console.log('   Title:', mockProcessedPost.title);
        console.log('   Quality Score:', mockProcessedPost.llmEvaluation.qualityScore);
        
        await storeToS3(mockProcessedPost);
        console.log('   ✅ Successfully stored post to S3\n');
        
        console.log('🎉 All storage tests passed!');
        
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        console.log('\n💡 Make sure you have:');
        console.log('   - AWS credentials configured');
        console.log('   - S3_BUCKET_NAME environment variable set');
        console.log('   - Proper IAM permissions for S3');
        process.exit(1);
    }
}

testStorage(); 