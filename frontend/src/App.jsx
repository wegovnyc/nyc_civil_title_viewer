import { useState, useEffect } from 'react'
import './App.css'
import { config } from './config'

function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Fetch CSV from S3
    fetch(`${config.baseUrl}${config.csvPath}`)
      .then(res => res.text())
      .then(csvText => {
        // Parse CSV manually
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Simple CSV parsing (handles quoted fields)
          const values = [];
          let current = '';
          let inQuotes = false;

          for (let char of lines[i]) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }

        setDocuments(data);
        if (data.length > 0) {
          setSelectedDoc(data[0]);
        }
      })
      .catch(err => console.error("Error fetching data:", err))
  }, [])

  const filteredDocs = documents.filter(doc =>
    doc['File Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc['Job Title'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc['Title Code'].includes(searchTerm)
  )

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="doc-list">
          {filteredDocs.map((doc, index) => (
            <div
              key={index}
              className={`doc-item ${selectedDoc === doc ? 'active' : ''}`}
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="doc-title">{doc['Job Title'] || doc['File Name']}</div>
              <div className="doc-meta">{doc['Title Code']} - {doc['Effective Date']}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {selectedDoc ? (
          <div className="split-view">
            <div className="data-panel">
              <h2>{selectedDoc['Title Code']}</h2>
              <div className="field-group">
                <label>File Name</label>
                <div>{selectedDoc['File Name']}</div>
              </div>
              <div className="field-group">
                <label>Header 1</label>
                <div>{selectedDoc['Header 1']}</div>
              </div>
              <div className="field-group">
                <label>Header 2</label>
                <div>{selectedDoc['Header 2']}</div>
              </div>
              <div className="field-group">
                <label>Title Code</label>
                <div>{selectedDoc['Title Code']}</div>
              </div>
              <div className="field-group">
                <label>Job Title</label>
                <div>{selectedDoc['Job Title']}</div>
              </div>
              <div className="field-group">
                <label>Effective Date</label>
                <div>{selectedDoc['Effective Date']}</div>
              </div>

              <div className="field-group">
                <label>Duties and Responsibilities</label>
                <div className="text-block">{selectedDoc['Duties and Responsibilities']}</div>
              </div>

              <div className="field-group">
                <label>Examples of Typical Tasks</label>
                <div className="text-block">{selectedDoc['Examples of Typical Tasks']}</div>
              </div>

              <div className="field-group">
                <label>Qualification Requirements</label>
                <div className="text-block">{selectedDoc['Qualification Requirements']}</div>
              </div>

              <div className="field-group">
                <label>Lines of Promotion</label>
                <div className="text-block">{selectedDoc['Lines of Promotion']}</div>
              </div>

              <div className="field-group">
                <label>Raw Text</label>
                <div className="text-block raw-text">{selectedDoc['Raw Text']}</div>
              </div>

              <div className="field-group">
                <label>Number of Pages</label>
                <div>{selectedDoc['Num Pages']}</div>
              </div>
            </div>

            <div className="pdf-panel">
              <iframe
                src={`${config.baseUrl}${config.pdfPath}${selectedDoc['File Name']}`}
                title="PDF Viewer"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        ) : (
          <div className="no-selection">Select a document to view</div>
        )}
      </div>
    </div>
  )
}

export default App
