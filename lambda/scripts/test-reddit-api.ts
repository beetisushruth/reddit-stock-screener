import { fetchWallStreetBetsPosts } from '../src/services/reddit.js';

/**
 * Test Reddit API compliance
 */
async function testRedditAPI() {
    console.log('🧪 Testing Reddit API compliance...');
    
    try {
        // Test basic fetch
        console.log('📡 Fetching posts from r/WallStreetBets...');
        const posts = await fetchWallStreetBetsPosts();
        
        console.log(`✅ Successfully fetched ${posts.length} posts`);
        
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
            console.log('\n🔄 Testing pagination...');
            const nextPosts = await fetchWallStreetBetsPosts(posts[0].id);
            console.log(`✅ Pagination successful: fetched ${nextPosts.length} posts`);
        }
        
        console.log('\n🎉 Reddit API test completed successfully!');
        
    } catch (error) {
        console.error('❌ Reddit API test failed:', error);
        process.exit(1);
    }
}

// Run the test
testRedditAPI(); 