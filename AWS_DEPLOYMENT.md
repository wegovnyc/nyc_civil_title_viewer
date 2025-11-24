# AWS S3 + CloudFront Deployment Guide

## Overview
This deployment uses AWS S3 for static file hosting and CloudFront for HTTPS and global CDN.

**Cost**: ~$0.05-2/month (essentially free for low-medium traffic)

## Prerequisites

1. **AWS Account**: Sign up at https://aws.amazon.com
2. **AWS CLI**: Install and configure
   ```bash
   # Install (Mac)
   brew install awscli
   
   # Configure with your credentials
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
   ```

## Deployment Steps

### Step 1: Update Configuration

Before deploying, update the S3 bucket name in `deploy-aws.sh`:

```bash
BUCKET_NAME="nyc-civil-title-viewer"  # Change to your preferred name (must be globally unique)
```

### Step 2: Run Deployment Script

```bash
cd "/Users/devin/Antigravity/NYC Civil/viewer_app"
./deploy-aws.sh
```

This script will:
1. Create S3 bucket
2. Build frontend
3. Upload frontend, CSV, and PDFs to S3
4. Configure static website hosting
5. Set public read permissions

**Note**: Uploading 932 PDFs may take 5-10 minutes depending on your internet speed.

### Step 3: Test Your App

After deployment, your app will be available at:
```
http://nyc-civil-title-viewer.s3-website-us-east-1.amazonaws.com
```

**Note**: This is HTTP only. For HTTPS, continue to Step 4.

### Step 4: Set Up CloudFront (Recommended for HTTPS)

1. **Go to CloudFront Console**: https://console.aws.amazon.com/cloudfront

2. **Create Distribution**:
   - Click "Create Distribution"
   - **Origin Domain**: `nyc-civil-title-viewer.s3-website-us-east-1.amazonaws.com`
     - ⚠️ Use the website endpoint, NOT the S3 bucket endpoint
   - **Origin Protocol**: HTTP only
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD
   - **Cache Policy**: CachingOptimized
   - **Price Class**: Use all edge locations (or choose based on your audience)
   - Click "Create Distribution"

3. **Wait for Deployment** (~15-20 minutes)
   - Status will change from "In Progress" to "Deployed"

4. **Get CloudFront URL**:
   - Copy the "Distribution domain name" (e.g., `d1234567890.cloudfront.net`)

### Step 5: Update Frontend Config

1. Edit `frontend/src/config.js`:
   ```javascript
   export const config = {
     baseUrl: 'https://d1234567890.cloudfront.net',  // Your CloudFront URL
     csvPath: '/extracted_data.csv',
     pdfPath: '/pdfs/'
   };
   ```

2. Rebuild and redeploy frontend:
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://nyc-civil-title-viewer/ --delete
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

### Step 6: (Optional) Set Up Custom Domain

1. **Register domain** or use existing domain
2. **Create SSL certificate** in AWS Certificate Manager (us-east-1 region)
3. **Add CNAME** in CloudFront distribution settings
4. **Update DNS** to point to CloudFront distribution

## Updating the App

To update content after initial deployment:

```bash
# Update frontend only
cd frontend
npm run build
aws s3 sync dist/ s3://nyc-civil-title-viewer/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

# Update CSV only
aws s3 cp "/path/to/extracted_data.csv" s3://nyc-civil-title-viewer/extracted_data.csv

# Update PDFs
aws s3 sync "/path/to/pdfs" s3://nyc-civil-title-viewer/pdfs/
```

## Cost Breakdown

- **S3 Storage**: ~$0.02-0.05/month (1GB)
- **S3 Requests**: ~$0.00/month (first 2,000 free)
- **CloudFront**: First 1TB free, then $0.085/GB
- **Data Transfer**: 100GB free/month

**Total**: ~$0.05-2/month for typical usage

## Troubleshooting

### PDFs Not Loading
- Check S3 bucket policy allows public read
- Verify PDF paths in S3 match CSV file names
- Check browser console for CORS errors

### CSV Not Parsing
- Verify CSV is uploaded correctly to S3
- Check CSV format (should be UTF-8 encoded)
- Look for parsing errors in browser console

### CloudFront Not Updating
- Create cache invalidation after updates
- Wait 5-10 minutes for propagation

### CORS Errors
- Ensure you're using the S3 website endpoint, not bucket endpoint
- CloudFront origin should be `bucket-name.s3-website-region.amazonaws.com`

## Security Notes

- Files are publicly readable (required for static hosting)
- No authentication is implemented
- Consider adding CloudFront signed URLs for private content
- Enable CloudFront access logging for monitoring

## Next Steps

- Set up custom domain
- Enable CloudFront access logs
- Set up AWS CloudWatch alarms for costs
- Consider adding AWS WAF for DDoS protection
