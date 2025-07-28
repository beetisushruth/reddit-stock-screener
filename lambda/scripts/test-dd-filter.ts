#!/usr/bin/env node
import { fetchWallStreetBetsPosts } from '../src/services/reddit.js';
import { filterDDPosts, testDDFiltering } from '../src/services/dd-filter.js';

async function testDDFilter() {
    console.log('🧪 Testing DD Filter...\n');
    
    try {
        // Fetch some posts to test with
        console.log('📡 Fetching posts for DD filtering test...');
        const posts = await fetchWallStreetBetsPosts();
        
        console.log(`📊 Total posts fetched: ${posts.length}\n`);
        
        // Test the filtering logic
        console.log('🔍 Running DD filtering logic...');
        testDDFiltering(posts);
        
        // Apply the filter
        console.log('\n🎯 Applying DD filter...');
        const ddPosts = filterDDPosts(posts);
        
        console.log(`✅ Found ${ddPosts.length} DD posts out of ${posts.length} total posts\n`);
        
        // Show DD posts
        if (ddPosts.length > 0) {
            console.log('📋 DD Posts Found:');
            ddPosts.forEach((post, index) => {
                console.log(`\n${index + 1}. "${post.title}"`);
                console.log(`   Flair: "${post.flair}"`);
                console.log(`   Text Length: ${post.selftext.length} characters`);
                console.log(`   ID: ${post.id}`);
            });
        } else {
            console.log('⚠️  No DD posts found in this batch');
        }
        
    } catch (error) {
        console.error('❌ DD Filter test failed:', error);
        process.exit(1);
    }
}

testDDFilter(); 