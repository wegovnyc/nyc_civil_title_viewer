#!/bin/bash

# AWS S3 Deployment Script for NYC Civil Title Viewer
# This script uploads all files to S3 for static hosting

set -e  # Exit on error

# Configuration
BUCKET_NAME="nyc-civil-title-viewer"
REGION="us-east-1"
PDF_DIR="/Users/devin/Antigravity/NYC Civil/FOIL Request - Civil Service Title Specifications"
CSV_FILE="/Users/devin/Antigravity/NYC Civil/extracted_data.csv"
FRONTEND_DIR="/Users/devin/Antigravity/NYC Civil/viewer_app/frontend"

echo "🚀 Starting AWS S3 Deployment..."

# Step 1: Create S3 bucket
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo "Bucket already exists"

# Step 2: Build frontend
echo "🔨 Building frontend..."
cd "$FRONTEND_DIR"
npm run build

# Step 3: Upload frontend files
echo "📤 Uploading frontend to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --region $REGION \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html separately with no cache
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --region $REGION \
  --cache-control "no-cache"

# Step 4: Upload CSV
echo "📤 Uploading CSV data..."
aws s3 cp "$CSV_FILE" s3://$BUCKET_NAME/extracted_data.csv \
  --region $REGION \
  --content-type "text/csv"

# Step 5: Upload PDFs
echo "📤 Uploading PDFs (this may take a while)..."
aws s3 sync "$PDF_DIR" s3://$BUCKET_NAME/pdfs/ \
  --region $REGION \
  --content-type "application/pdf"

# Step 6: Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME/ \
  --index-document index.html \
  --error-document index.html

# Step 7: Make bucket publicly readable
echo "🔓 Setting public read permissions..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadGetObject\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
  }]
}"

# Step 8: Disable block public access
echo "🔓 Disabling block public access..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your app is available at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "🔐 For HTTPS and custom domain, set up CloudFront:"
echo "   1. Go to: https://console.aws.amazon.com/cloudfront"
echo "   2. Create distribution with origin: $BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   3. Update frontend/src/config.js with CloudFront URL"
echo "   4. Rebuild and redeploy frontend"
echo ""
