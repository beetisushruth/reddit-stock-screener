import axios from 'axios';
import { CONFIG } from '../config/index.js';
import { RedditPost, RedditAPIResponse } from '../types/index.js';

/**
 * Fetch posts from r/WallStreetBets using public API (no auth required)
 */
export async function fetchWallStreetBetsPosts(afterPostId: string | null = null): Promise<RedditPost[]> {
    try {
        let url = `https://api.reddit.com/r/${CONFIG.SUBREDDIT}/new?limit=${CONFIG.POST_LIMIT}`;
        
        // Add 'after' parameter if we have a last processed post ID
        if (afterPostId) {
            url += `&after=t3_${afterPostId}`;
        }
        
        console.log(`Fetching from URL: ${url}`);
        
        const response = await axios.get<RedditAPIResponse>(url, {
            headers: {
                'User-Agent': CONFIG.USER_AGENT
            }
        });
        
        const posts: RedditPost[] = response.data.data.children.map(child => ({
            id: child.data.id,
            title: child.data.title,
            selftext: child.data.selftext || '',
            flair: child.data.link_flair_text || ''
        }));
        
        return posts;
    } catch (error) {
        console.error('Error fetching Reddit posts:', error);
        throw error;
    }
} 