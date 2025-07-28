#!/usr/bin/env node
import { evaluateWithLLM } from '../src/services/llm.js';
import { RedditPost } from '../src/types/index.js';

async function testLLM() {
    console.log('🧪 Testing LLM Evaluation...\n');
    
    // Create a mock DD post for testing
    const mockPost: RedditPost = {
        id: 'test123',
        title: '[DD] Tesla Stock Analysis - Why I\'m Bullish on TSLA',
        selftext: `I've been analyzing Tesla's fundamentals and technical indicators for the past month. Here's my comprehensive analysis:

**Fundamental Analysis:**
- Revenue growth: 20% YoY
- Profit margins improving
- Strong cash flow position
- Market leadership in EVs

**Technical Analysis:**
- Support at $200 level
- RSI showing oversold conditions
- MACD crossover imminent
- Volume increasing on recent dips

**Catalysts:**
- New product launches
- International expansion
- Battery technology improvements
- Regulatory tailwinds

**Risks:**
- Competition from traditional automakers
- Supply chain challenges
- Regulatory changes

**Conclusion:** I believe TSLA is undervalued at current levels and see 30% upside potential over the next 6 months.`,
        flair: 'DD'
    };
    
    try {
        console.log('🤖 Testing LLM evaluation with mock DD post...\n');
        console.log('📝 Post Title:', mockPost.title);
        console.log('🏷️  Flair:', mockPost.flair);
        console.log('📄 Content Length:', mockPost.selftext.length, 'characters\n');
        
        console.log('⏳ Evaluating with Amazon Bedrock...');
        const evaluation = await evaluateWithLLM(mockPost);
        
        console.log('\n✅ LLM Evaluation Results:');
        console.log(`   Quality Score: ${evaluation.qualityScore}/10`);
        console.log(`   Summary: ${evaluation.summary}`);
        console.log(`   Reasoning: ${evaluation.reasoning}\n`);
        
        // Test with a low-quality post
        const lowQualityPost: RedditPost = {
            id: 'test456',
            title: 'TSLA to the moon! 🚀',
            selftext: 'Just bought more TSLA. Going to the moon! Diamond hands! 💎🙌',
            flair: 'Gain'
        };
        
        console.log('🤖 Testing LLM evaluation with low-quality post...\n');
        console.log('📝 Post Title:', lowQualityPost.title);
        console.log('🏷️  Flair:', lowQualityPost.flair);
        console.log('📄 Content Length:', lowQualityPost.selftext.length, 'characters\n');
        
        const lowQualityEvaluation = await evaluateWithLLM(lowQualityPost);
        
        console.log('✅ LLM Evaluation Results:');
        console.log(`   Quality Score: ${lowQualityEvaluation.qualityScore}/10`);
        console.log(`   Summary: ${lowQualityEvaluation.summary}`);
        console.log(`   Reasoning: ${lowQualityEvaluation.reasoning}\n`);
        
    } catch (error) {
        console.error('❌ LLM test failed:', error);
        process.exit(1);
    }
}

testLLM(); 