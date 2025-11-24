from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
import csv
import os

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

# Use environment variables for production, fallback to local paths
CSV_FILE = os.environ.get('CSV_FILE', "/Users/devin/Antigravity/NYC Civil/extracted_data.csv")
PDF_DIR = os.environ.get('PDF_DIR', "/Users/devin/Antigravity/NYC Civil/FOIL Request - Civil Service Title Specifications")

@app.route('/api/data')
def get_data():
    data = []
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(data)

@app.route('/pdfs/<path:filename>')
def serve_pdf(filename):
    return send_from_directory(PDF_DIR, filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_file(os.path.join(app.static_folder, 'index.html'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)

