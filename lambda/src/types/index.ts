// Type definitions for the Reddit Stock Screener Lambda

export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    flair: string;
}

export interface ProcessedPost extends RedditPost {
    llmEvaluation: LLMEvaluation;
}

export interface LLMEvaluation {
    qualityScore: number;
    summary: string;
    reasoning: string;
}

export interface RedditAPIResponse {
    data: {
        children: Array<{
            data: {
                id: string;
                title: string;
                selftext: string;
                link_flair_text: string | null;
            };
        }>;
    };
}

export interface LambdaEvent {
    lastProcessedPostId?: string;
}

export interface LambdaResponse {
    statusCode: number;
    body: string;
}

export interface StateData {
    lastProcessedPostId: string;
    timestamp: string;
} 