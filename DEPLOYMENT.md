# Deploying PDF Viewer App to AWS S3 + CloudFront

> **Note**: This application is deployed on AWS S3 with static hosting. The Render configuration was a draft option that was never used.

## Prerequisites
- GitHub account
- Render account (free tier available at https://render.com)
- Git installed locally

## Step 1: Prepare the Repository

1. **Initialize Git** (if not already done):
   ```bash
   cd "/Users/devin/Antigravity/NYC Civil/viewer_app"
   git init
   git add .
   git commit -m "Initial commit: PDF Viewer App"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `nyc-civil-pdf-viewer`)
   - Don't initialize with README (we already have code)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nyc-civil-pdf-viewer.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Upload Data Files to Render

Since the PDFs and CSV are large, you'll need to upload them separately:

**Option A: Use Render Disks (Recommended)**
- Render Disks allow persistent storage
- You'll upload the PDFs and CSV to a disk
- Cost: ~$1/month for 1GB

**Option B: Use External Storage**
- Upload PDFs to S3, Google Cloud Storage, or similar
- Update environment variables to point to the storage URLs

## Step 3: Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `nyc-civil-pdf-viewer` repository

3. **Configure the Service**:
   - **Name**: `pdf-viewer-app`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or set to `viewer_app` if you pushed the parent folder)
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build && cd ../backend && pip install -r ../requirements.txt
     ```
   - **Start Command**: 
     ```
     cd backend && gunicorn app:app
     ```

4. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `CSV_FILE`: `/path/to/extracted_data.csv` (update after uploading to disk)
     - `PDF_DIR`: `/path/to/pdfs` (update after uploading to disk)
     - `PYTHON_VERSION`: `3.12.0`

5. **Create a Disk** (if using Option A):
   - In the service settings, go to "Disks"
   - Click "Add Disk"
   - Name: `pdf-storage`
   - Mount Path: `/data`
   - Size: 1GB (or more depending on your PDFs)

6. **Upload Files to Disk**:
   - After deployment, SSH into your service or use Render's file upload
   - Upload `extracted_data.csv` to `/data/extracted_data.csv`
   - Upload PDFs to `/data/pdfs/`
   - Update environment variables:
     - `CSV_FILE`: `/data/extracted_data.csv`
     - `PDF_DIR`: `/data/pdfs`

7. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Wait for the build to complete (~5-10 minutes)

## Step 4: Access Your App

Once deployed, Render will provide a URL like:
`https://pdf-viewer-app.onrender.com`

## Troubleshooting

- **Build fails**: Check the build logs in Render dashboard
- **PDFs not loading**: Verify the `PDF_DIR` environment variable is correct
- **Data not showing**: Verify the `CSV_FILE` environment variable is correct
- **CORS errors**: The app is configured to allow all origins, but you can restrict this in production

## Cost Estimate

- **Free Tier**: Render offers 750 hours/month free for web services
- **Disk Storage**: ~$1/month for 1GB
- **Total**: ~$1/month (or free if you use external storage)

## Notes

- The free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- For production use, consider upgrading to a paid plan ($7/month) for always-on service
