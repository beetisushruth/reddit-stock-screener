import { CONFIG } from '../config/index.js';
import { RedditPost } from '../types/index.js';

/**
 * Filter posts for DD (Due Diligence) content
 */
export function filterDDPosts(posts: RedditPost[]): RedditPost[] {
    return posts.filter(post => {
        const title = post.title.toLowerCase();
        const text = post.selftext.toLowerCase();
        const flair = post.flair.toLowerCase();
        
        // Check if flair is "DD" (exact match or contains "dd")
        const hasDDFlair = flair === 'dd';
        
        // Check if title contains DD keywords
        const hasDDKeywords = CONFIG.DD_KEYWORDS.some(keyword => 
            title.includes(keyword) || text.includes(keyword)
        );
        
        // Check if title starts with [DD] or similar patterns
        const hasDDTag = /^\[?dd\]?/i.test(title) || 
                        /^\[?due diligence\]?/i.test(title) ||
                        /^\[?analysis\]?/i.test(title);
        
        // Check if text contains substantial analysis content
        const hasSubstantialText = text.length > CONFIG.MIN_TEXT_LENGTH && (
            text.includes('analysis') || 
            text.includes('research') || 
            text.includes('fundamental') ||
            text.includes('technical') ||
            text.includes('valuation')
        );
        
        return hasDDFlair || hasDDKeywords || hasDDTag || hasSubstantialText;
    });
}

/**
 * Test DD filtering logic (for debugging)
 */
export function testDDFiltering(posts: RedditPost[]): void {
    console.log('Testing DD filtering logic...');
    
    posts.forEach((post, index) => {
        const title = post.title.toLowerCase();
        const text = post.selftext.toLowerCase();
        const flair = post.flair.toLowerCase();
        
        const hasDDFlair = flair === 'dd';
        const hasDDKeywords = CONFIG.DD_KEYWORDS.some(keyword => 
            title.includes(keyword) || text.includes(keyword)
        );
        const hasDDTag = /^\[?dd\]?/i.test(title) || 
                        /^\[?due diligence\]?/i.test(title) ||
                        /^\[?analysis\]?/i.test(title);
        const hasSubstantialText = text.length > CONFIG.MIN_TEXT_LENGTH && (
            text.includes('analysis') || 
            text.includes('research') || 
            text.includes('fundamental') ||
            text.includes('technical') ||
            text.includes('valuation')
        );
        
        const isDD = hasDDFlair || hasDDKeywords || hasDDTag || hasSubstantialText;
        
        console.log(`Post ${index + 1}: "${post.title}"`);
        console.log(`  Flair: "${post.flair}" (DD: ${hasDDFlair})`);
        console.log(`  Keywords: ${hasDDKeywords}`);
        console.log(`  DD Tag: ${hasDDTag}`);
        console.log(`  Substantial Text: ${hasSubstantialText}`);
        console.log(`  Is DD: ${isDD}`);
        console.log('---');
    });
} 