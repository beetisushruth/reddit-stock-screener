import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { CONFIG } from '../config/index.js';
import { RedditPost, LLMEvaluation } from '../types/index.js';

// Shared client instance
const bedrockClient = new BedrockRuntimeClient({ region: CONFIG.AWS_REGION });

/**
 * Evaluate post with Amazon Bedrock LLM
 */
export async function evaluateWithLLM(post: RedditPost): Promise<LLMEvaluation> {
    try {
        const prompt = `Rate the following WallStreetBets DD post on a scale from 0 to 10 for insight, credibility, and relevance. Provide a brief summary.

Title: ${post.title}
Content: ${post.selftext.substring(0, CONFIG.MAX_CONTENT_LENGTH)}...

Respond in JSON format:
{
  "qualityScore": number,
  "summary": "brief summary",
  "reasoning": "explanation of the score"
}`;

        const command = new InvokeModelCommand({
            modelId: CONFIG.BEDROCK_MODEL_ID,
            contentType: 'application/json',
            body: JSON.stringify({
                prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
                max_tokens: 500,
                temperature: 0.1
            })
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Parse the LLM response
        const llmText = responseBody.completion || responseBody.content || '';
        const jsonMatch = llmText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as LLMEvaluation;
        } else {
            return {
                qualityScore: 5,
                summary: "Unable to parse LLM response",
                reasoning: llmText
            };
        }
    } catch (error) {
        console.error('Error evaluating with LLM:', error);
        return {
            qualityScore: 5,
            summary: "LLM evaluation failed",
            reasoning: error instanceof Error ? error.message : 'Unknown error'
        };
    }
} 