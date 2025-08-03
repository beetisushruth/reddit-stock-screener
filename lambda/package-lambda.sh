#!/bin/bash

# Exit on any error
set -e

echo "🔧 Building Lambda package..."

# Clean up any existing temp directory and zip
rm -rf temp-package
rm -f lambda-function.zip   

# Create temp directory
echo "📁 Creating temporary package directory..."
mkdir -p temp-package

# Copy compiled files from dist to root level
echo "📋 Copying compiled files..."
cp -r dist/src/* temp-package/
cp -r dist/scripts temp-package/

# Copy package.json for ES modules
echo "📄 Copying package.json..."
cp package.json temp-package/

# Copy node_modules
echo "📦 Copying dependencies..."
cp -r node_modules temp-package/

# Create zip file
echo "🗜️  Creating deployment package..."
cd temp-package
rm -rf ../lambda-function.zip
zip -r ../lambda-function.zip .
cd ..

# Clean up temp directory
echo "🧹 Cleaning up temporary files..."
rm -rf temp-package
    
echo "✅ Lambda package created: lambda-function.zip"
echo "📏 Package size: $(du -h lambda-function.zip | cut -f1)" 