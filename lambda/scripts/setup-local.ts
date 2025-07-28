#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

async function setupLocal() {
    console.log('🔧 Setting up local development environment...\n');
    
    try {
        // Check if .env exists
        const envPath = join(process.cwd(), '.env');
        const envExamplePath = join(process.cwd(), 'env.example');
        
        if (!existsSync(envPath)) {
            console.log('📝 Creating .env file from template...');
            
            if (existsSync(envExamplePath)) {
                const envContent = readFileSync(envExamplePath, 'utf8');
                writeFileSync(envPath, envContent);
                console.log('   ✅ Created .env file');
            } else {
                console.log('   ⚠️  env.example not found, creating basic .env');
                const basicEnv = `# AWS Configuration
AWS_REGION=us-east-1

# S3 Configuration (required for pagination and archiving)
S3_BUCKET_NAME=dd-posts-bucket

# SNS Configuration (optional - for notifications)
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:dd-notifications
NOTIFICATION_EMAIL=your-email@example.com

# LLM Configuration
QUALITY_THRESHOLD=7.0
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Local Development
# Fill in your actual values below
`;
                writeFileSync(envPath, basicEnv);
                console.log('   ✅ Created basic .env file');
            }
        } else {
            console.log('   ✅ .env file already exists');
        }
        
        // Build TypeScript
        console.log('\n🔨 Building TypeScript...');
        const { execSync } = await import('child_process');
        execSync('pnpm run build', { stdio: 'inherit' });
        console.log('   ✅ TypeScript build completed');
        
        // Check AWS credentials
        console.log('\n🔑 Checking AWS credentials...');
        try {
            execSync('aws sts get-caller-identity', { stdio: 'pipe' });
            console.log('   ✅ AWS credentials configured');
        } catch (error) {
            console.log('   ⚠️  AWS credentials not configured or invalid');
            console.log('   💡 Run: aws configure');
        }
        
        console.log('\n🎉 Local setup completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Edit .env file with your actual values');
        console.log('2. Run individual tests: pnpm run test:reddit');
        console.log('3. Run full pipeline test: pnpm run test:local');
        console.log('4. Run all tests: pnpm run test:all');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setupLocal(); 