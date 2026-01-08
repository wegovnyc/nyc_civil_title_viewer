import { useState, useEffect } from 'react'
import './App.css'
import { config } from './config'

function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Check if we are in no-menu mode
    if (window.location.pathname.includes('/no-menu/')) {
      setShowSidebar(false);
    }
  }, []);

  const downloadRawText = (doc) => {
    const blob = new Blob([doc['Raw Text'] || 'No raw text available'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc['Title Code']}_raw_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle URL-based document selection
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');

    if (codeParam) {
      if (documents.length > 0) {
        const doc = documents.find(d => d['Title Code'] === codeParam);
        if (doc) {
          setSelectedDoc(doc);
          setNotFound(false);
        } else {
          // Document not found for the provided code
          setSelectedDoc(null);
          setNotFound(true);
        }
      }
      // If documents are empty but we finished loading, that's a different problem (empty CSV?), 
      // likely fine to treat as not found if code was asked for.
      else {
        setNotFound(true);
      }
    } else {
      // No code param
      // If we have docs and nothing selected, maybe select first? 
      // Logic from before: "else if (data.length > 0) setSelectedDoc(data[0])"
      // Let's keep that behavior if desired, or just leave null "Select a document"
      if (!selectedDoc && documents.length > 0) {
        setSelectedDoc(documents[0]);
      }
    }
  }, [documents, loading]);

  useEffect(() => {
    // Fetch CSV from S3
    setLoading(true);
    fetch(`${config.baseUrl}${config.csvPath}`)
      .then(res => res.text())
      .then(csvText => {
        // Robust CSV parsing that handles quoted fields with newlines
        const parseCSV = (text) => {
          const rows = [];
          let currentRow = [];
          let currentField = '';
          let inQuotes = false;

          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // End of field
              currentRow.push(currentField);
              currentField = '';
            } else if (char === '\n' && !inQuotes) {
              // End of row
              if (currentField || currentRow.length > 0) {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
              }
            } else {
              currentField += char;
            }
          }

          // Push last field and row
          if (currentField || currentRow.length > 0) {
            currentRow.push(currentField);
            rows.push(currentRow);
          }

          return rows;
        };

        const rows = parseCSV(csvText);
        const headers = rows[0];
        const data = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        }).filter(row => row['File Name']); // Filter out empty rows

        setDocuments(data);

        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      })
  }, [])

  const filteredDocs = documents.filter(doc =>
    doc['File Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc['Job Title'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc['Title Code'].includes(searchTerm)
  )

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    setNotFound(false);
    // Update URL with permalink using Title Code only
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('code', doc['Title Code']);
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content">
        {showSidebar && (
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
                  onClick={() => handleDocumentSelect(doc)}
                >
                  <div className="doc-title">{doc['Job Title'] || doc['File Name']}</div>
                  <div className="doc-meta">{doc['Title Code']} - {doc['Effective Date']}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`main-content ${!showSidebar ? 'full-width' : ''}`}>
          {notFound ? (
            <div className="not-found-container" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Title Code Not Found</h3>
              <p>We don't have a title description for this title code. If you have information about a title description for this title code, please let us know at <a href="https://wegov.nyc/contact">wegov.nyc/contact</a>.</p>
            </div>
          ) : selectedDoc ? (
            <div className="split-view">
              <div className="data-panel">
                <h2>{selectedDoc['Title Code']}</h2>

                <div className="field-group">
                  <label>Job Title</label>
                  <div>{selectedDoc['Job Title']}</div>
                </div>
                <div className="field-group">
                  <label>Effective Date</label>
                  <div>{selectedDoc['Effective Date']}</div>
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
                  <label>File Name</label>
                  <div>{selectedDoc['File Name']}</div>
                </div>
                <div className="field-group">
                  <label>Title Code</label>
                  <div>{selectedDoc['Title Code']}</div>
                </div>
                <div className="field-group">
                  <label>Number of Pages</label>
                  <div>{selectedDoc['Num Pages']}</div>
                </div>

                <div className="field-group">
                  <label>Downloads</label>
                  <div className="download-links">
                    <button
                      onClick={() => {
                        // Fetch full CSV to get raw text for this document
                        fetch(`${config.baseUrl}/extracted_data_full.csv`)
                          .then(res => res.text())
                          .then(csvText => {
                            // Use the same robust CSV parser
                            const parseCSV = (text) => {
                              const rows = [];
                              let currentRow = [];
                              let currentField = '';
                              let inQuotes = false;

                              for (let i = 0; i < text.length; i++) {
                                const char = text[i];
                                const nextChar = text[i + 1];

                                if (char === '"') {
                                  if (inQuotes && nextChar === '"') {
                                    currentField += '"';
                                    i++;
                                  } else {
                                    inQuotes = !inQuotes;
                                  }
                                } else if (char === ',' && !inQuotes) {
                                  currentRow.push(currentField);
                                  currentField = '';
                                } else if (char === '\n' && !inQuotes) {
                                  if (currentField || currentRow.length > 0) {
                                    currentRow.push(currentField);
                                    rows.push(currentRow);
                                    currentRow = [];
                                    currentField = '';
                                  }
                                } else {
                                  currentField += char;
                                }
                              }

                              if (currentField || currentRow.length > 0) {
                                currentRow.push(currentField);
                                rows.push(currentRow);
                              }

                              return rows;
                            };

                            const rows = parseCSV(csvText);
                            const headers = rows[0];
                            const rawTextIndex = headers.findIndex(h => h.trim() === 'Raw Text');
                            const fileNameIndex = headers.findIndex(h => h.trim() === 'File Name');

                            // Find the row for this document
                            for (let i = 1; i < rows.length; i++) {
                              if (rows[i][fileNameIndex] === selectedDoc['File Name']) {
                                const rawText = rows[i][rawTextIndex] || 'No raw text available';

                                const blob = new Blob([rawText], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedDoc['Title Code']}_extracted_text.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                break;
                              }
                            }
                          });
                      }}
                      className="download-btn"
                    >
                      📝 Download Extracted Text
                    </button>
                  </div>
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

      <footer className="app-footer">
        <p>
          Data from Department of Citywide Administrative Services (DCAS) sent November 18, 2024 in response to FOIL-2024-868-00064 submitted by <a href="https://wegovnyc.org" target="_blank" rel="noopener noreferrer">WeGovNYC</a>. Site by <a href="https://wegovnyc.org" target="_blank" rel="noopener noreferrer">WeGovNYC</a>
          {' | '}
          <a href={`${config.baseUrl}/extracted_data_full.csv`} download className="footer-link">📥 Download All Extracted Text (CSV)</a>
        </p>
      </footer>
    </div>
  )
}

export default App
