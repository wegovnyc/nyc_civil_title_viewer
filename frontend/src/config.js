// S3 Configuration
// Update this after creating your S3 bucket and CloudFront distribution

export const config = {
    // Direct S3 website URL
    baseUrl: 'http://nyc-civil-title-viewer.s3-website-us-east-1.amazonaws.com',

    // Paths
    csvPath: '/extracted_data.csv',
    pdfPath: '/pdfs/'
};
