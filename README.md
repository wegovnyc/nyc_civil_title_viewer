# NYC Civil Service PDF Viewer

A web application to view NYC Civil Service Title Specifications with extracted data displayed alongside the original PDF documents.

## Features

- **Searchable Document List**: Search by file name, job title, or title code
- **Split-Screen View**: Extracted data on the left, original PDF on the right
- **Comprehensive Data**: Displays all extracted fields including duties, qualifications, and more
- **932 Documents**: Complete collection of Civil Service Title Specifications

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React + Vite
- **Data**: CSV with extracted PDF content

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+

### Setup

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   pip install -r ../requirements.txt
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Run Backend** (in one terminal):
   ```bash
   cd backend
   python3 app.py
   ```

4. **Run Frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the App**:
   - Open http://localhost:5173

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Render.

## Data

- **CSV File**: `extracted_data.csv` (932 documents)
- **PDF Files**: Located in `FOIL Request - Civil Service Title Specifications/`
- **Fields**: File Name, Headers, Title Code, Job Title, Effective Date, Duties, Tasks, Qualifications, Promotion Lines, Raw Text

## License

Data sourced from NYC FOIL Request.
