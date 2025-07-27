import { LambdaEvent, LambdaResponse, RedditPost, ProcessedPost } from './types/index.js';
import { fetchWallStreetBetsPosts } from './services/reddit.js';
import { filterDDPosts, testDDFiltering } from './services/dd-filter.js';
import { evaluateWithLLM } from './services/llm.js';
import { getLastProcessedPostId, storeLastProcessedPostId, storeToS3 } from './services/storage.js';
import { sendNotification, shouldSendNotification } from './services/notification.js';

// Lambda handler function
export const handler = async (event: LambdaEvent, _context: any): Promise<LambdaResponse> => {
    try {
        console.log('Starting Reddit scraper for r/WallStreetBets');
        
        // Get the last processed post ID from S3, environment, or event
        const lastProcessedPostId = await getLastProcessedPostId() || event.lastProcessedPostId || null;
        
        if (lastProcessedPostId) {
            console.log(`Fetching posts after: ${lastProcessedPostId}`);
        } else {
            console.log('First run - fetching latest posts');
        }
        
        // Fetch new posts from r/WallStreetBets (no auth required)
        const posts = await fetchWallStreetBetsPosts(lastProcessedPostId);
        
        if (posts.length === 0) {
            console.log('No new posts found');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'No new posts found',
                    lastProcessedPostId: lastProcessedPostId
                })
            };
        }
        
        // Debug: Test DD filtering logic
        testDDFiltering(posts);
        
        // Filter for DD posts
        const ddPosts = filterDDPosts(posts);
        
        console.log(`Found ${posts.length} total posts, ${ddPosts.length} DD posts`);
        
        // Log details about DD posts for debugging
        ddPosts.forEach((post: RedditPost, index: number) => {
            console.log(`DD Post ${index + 1}:`, {
                title: post.title,
                flair: post.flair,
                textLength: post.selftext.length,
                id: post.id
            });
        });
        
        // Process DD posts with LLM evaluation
        const processedPosts: ProcessedPost[] = [];
        for (const post of ddPosts) {
            try {
                const llmResult = await evaluateWithLLM(post);
                const processedPost: ProcessedPost = {
                    ...post,
                    llmEvaluation: llmResult
                };
                
                // Store to S3 if configured
                await storeToS3(processedPost);
                
                // Send notification if quality threshold met
                if (shouldSendNotification(llmResult.qualityScore)) {
                    await sendNotification(processedPost);
                }
                
                processedPosts.push(processedPost);
            } catch (error) {
                console.error(`Error processing post ${post.id}:`, error);
            }
        }
        
        // Update the last processed post ID (use the first post's ID as it's the newest)
        const newLastProcessedPostId = posts[0].id;
        
        // Store the new last processed post ID
        await storeLastProcessedPostId(newLastProcessedPostId);
        
        // Return the results
        return {
            statusCode: 200,
            body: JSON.stringify({
                totalPosts: posts.length,
                ddPostsCount: ddPosts.length,
                processedPostsCount: processedPosts.length,
                lastProcessedPostId: newLastProcessedPostId,
                posts: posts,
                ddPosts: ddPosts,
                processedPosts: processedPosts
            })
        };
        
    } catch (error) {
        console.error('Error in Lambda handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}; 