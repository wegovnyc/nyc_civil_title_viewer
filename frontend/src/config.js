// S3 Configuration
// Update this after creating your S3 bucket and CloudFront distribution

export const config = {
    // Option 1: Direct S3 URL (use during initial setup)
    // baseUrl: 'https://YOUR-BUCKET-NAME.s3.amazonaws.com',

    // Option 2: CloudFront URL (use after CloudFront is set up)
    baseUrl: 'https://YOUR-CLOUDFRONT-ID.cloudfront.net',

    // Paths
    csvPath: '/extracted_data.csv',
    pdfPath: '/pdfs/'
};
