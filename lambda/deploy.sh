#!/bin/bash

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Create deployment package
pnpm run package

# Deploy to AWS Lambda (you'll need to update the function name)
aws lambda update-function-code \
    --function-name reddit-stock-screener \
    --zip-file fileb://function.zip

echo "Deployment complete!" 