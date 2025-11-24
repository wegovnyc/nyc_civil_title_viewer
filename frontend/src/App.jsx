import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setDocuments(data)
        if (data.length > 0) {
          setSelectedDoc(data[0])
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
                src={`/pdfs/${selectedDoc['File Name']}`}
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
