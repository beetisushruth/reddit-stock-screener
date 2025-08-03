import { fetchWallStreetBetsPosts } from '../src/services/reddit.js';

/**
 * Test Reddit OAuth authentication
 */
async function testRedditOAuth() {
    console.log('🧪 Testing Reddit OAuth authentication...');
    
    try {
        // Test basic fetch with OAuth
        console.log('📡 Fetching posts from r/WallStreetBets using OAuth...');
        const posts = await fetchWallStreetBetsPosts();
        
        console.log(`✅ Successfully fetched ${posts.length} posts using OAuth`);
        
        if (posts.length > 0) {
            console.log('\n📋 Sample post:');
            const samplePost = posts[0];
            console.log(`  Title: ${samplePost.title}`);
            console.log(`  ID: ${samplePost.id}`);
            console.log(`  Flair: ${samplePost.flair}`);
            console.log(`  Text length: ${samplePost.selftext.length} characters`);
        }
        
        // Test pagination
        if (posts.length > 0) {
            console.log('\n🔄 Testing pagination with OAuth...');
            const nextPosts = await fetchWallStreetBetsPosts(posts[0].id);
            console.log(`✅ Pagination successful: fetched ${nextPosts.length} posts`);
        }
        
        console.log('\n🎉 Reddit OAuth test completed successfully!');
        
    } catch (error) {
        console.error('❌ Reddit OAuth test failed:', error);
        process.exit(1);
    }
}

// Run the test
testRedditOAuth(); 