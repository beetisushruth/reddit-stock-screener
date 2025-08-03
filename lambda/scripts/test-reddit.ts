#!/usr/bin/env node
import { fetchWallStreetBetsPosts } from '../src/services/reddit.js';

async function testRedditAPI() {
    console.log('🧪 Testing Reddit API...\n');
    
    try {
        console.log('📡 Fetching posts from r/WallStreetBets...');
        const afterPostId = '1m9zqmd';
        const posts = await fetchWallStreetBetsPosts(afterPostId);
        
        console.log(`✅ Successfully fetched ${posts.length} posts\n`);
        
        // Display first 3 posts as examples
        posts.slice(0, 3).forEach((post, index) => {
            console.log(`📝 Post ${index + 1}:`);
            console.log(`   Title: ${post.title}`);
            console.log(`   Flair: "${post.flair}"`);
            console.log(`   Text Length: ${post.selftext.length} characters`);
            console.log(`   ID: ${post.id}`);
            console.log('');
        });
        
        // Test pagination
        if (posts.length > 0) {
            console.log('🔄 Testing pagination...');
            const paginatedPosts = await fetchWallStreetBetsPosts(posts[0].id);
            console.log(`✅ Pagination works - fetched ${paginatedPosts.length} posts after ${posts[0].id}\n`);
        }
        
    } catch (error) {
        console.error('❌ Reddit API test failed:', error);
        process.exit(1);
    }
}

testRedditAPI(); 