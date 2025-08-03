#!/usr/bin/env node
import { fetchWallStreetBetsPosts } from '../src/services/reddit.js';
import { filterDDPosts } from '../src/services/dd-filter.js';
import { evaluateWithLLM } from '../src/services/llm.js';
import { storeToS3, storeLastProcessedPostId } from '../src/services/storage.js';
import { sendNotification, shouldSendNotification } from '../src/services/notification.js';
import { ProcessedPost } from '../src/types/index.js';

async function testFullPipeline() {
    console.log('🚀 Testing Full Pipeline Locally...\n');
    
    try {
        // Step 1: Fetch posts from Reddit
        console.log('📡 Step 1: Fetching posts from Reddit...');
        const posts = await fetchWallStreetBetsPosts();
        console.log(`   ✅ Fetched ${posts.length} posts\n`);
        
        if (posts.length === 0) {
            console.log('⚠️  No posts found, skipping remaining steps');
            return;
        }
        
        // Step 2: Filter for DD posts
        console.log('🔍 Step 2: Filtering for DD posts...');
        const ddPosts = filterDDPosts(posts);
        console.log(`   ✅ Found ${ddPosts.length} DD posts out of ${posts.length} total\n`);
        
        if (ddPosts.length === 0) {
            console.log('⚠️  No DD posts found, skipping LLM evaluation');
            return;
        }
        
        // Step 3: Evaluate with LLM (limit to first 2 for testing)
        console.log('🤖 Step 3: Evaluating posts with LLM...');
        const postsToEvaluate = ddPosts.slice(0, 2); // Limit for testing
        const processedPosts: ProcessedPost[] = [];
        
        for (const post of postsToEvaluate) {
            console.log(`   📝 Evaluating: "${post.title}"`);
            try {
                const llmResult = await evaluateWithLLM(post);
                const processedPost: ProcessedPost = {
                    ...post,
                    llmEvaluation: llmResult
                };
                processedPosts.push(processedPost);
                console.log(`   ✅ Score: ${llmResult.qualityScore}/10`);
            } catch (error) {
                console.log(`   ❌ Failed to evaluate post ${post.id}:`, error);
            }
        }
        console.log('');
        
        // Step 4: Store to S3
        console.log('💾 Step 4: Storing posts to S3...');
        for (const post of processedPosts) {
            try {
                await storeToS3(post);
                console.log(`   ✅ Stored post ${post.id} to S3`);
            } catch (error) {
                console.log(`   ❌ Failed to store post ${post.id}:`, error);
            }
        }
        console.log('');
        
        // Step 5: Send notifications
        console.log('📧 Step 5: Sending notifications...');
        let notificationCount = 0;
        for (const post of processedPosts) {
            if (shouldSendNotification(post.llmEvaluation.qualityScore)) {
                try {
                    await sendNotification(post);
                    console.log(`   ✅ Sent notification for post ${post.id} (Score: ${post.llmEvaluation.qualityScore})`);
                    notificationCount++;
                } catch (error) {
                    console.log(`   ❌ Failed to send notification for post ${post.id}:`, error);
                }
            } else {
                console.log(`   ⏭️  Skipped notification for post ${post.id} (Score: ${post.llmEvaluation.qualityScore})`);
            }
        }
        console.log('');
        
        // Step 6: Update last processed post ID
        console.log('🔄 Step 6: Updating last processed post ID...');
        const newLastProcessedPostId = posts[0].id;
        await storeLastProcessedPostId(newLastProcessedPostId);
        console.log(`   ✅ Updated last processed post ID to: ${newLastProcessedPostId}\n`);
        
        // Summary
        console.log('📊 Pipeline Summary:');
        console.log(`   Total posts fetched: ${posts.length}`);
        console.log(`   DD posts found: ${ddPosts.length}`);
        console.log(`   Posts evaluated: ${processedPosts.length}`);
        console.log(`   Notifications sent: ${notificationCount}`);
        console.log(`   Last processed ID: ${newLastProcessedPostId}`);
        
        console.log('\n🎉 Full pipeline test completed successfully!');
        
    } catch (error) {
        console.error('❌ Pipeline test failed:', error);
        process.exit(1);
    }
}

testFullPipeline(); 