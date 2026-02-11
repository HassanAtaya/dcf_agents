PYTHON AI SERVICE SETUP
=======================

Prerequisites:
- Python 3.11+
- pip

Steps:
1. Navigate to: ai_python/
2. (Optional) Create virtual env: python -m venv venv && venv\Scripts\activate
3. Install dependencies: pip install -r requirements.txt
   Note: CrewAI has a large dependency tree; first install may take several minutes.
4. Run: python main.py
5. Service starts on http://localhost:5000

API Endpoints:
- POST /api/dcf/start            - Start DCF analysis pipeline (body: company_name, api_key, prompts)
- GET  /api/dcf/status/<job_id>  - Get job status (agent progress, results)
- GET  /api/dcf/download/<job_id> - Download ZIP report (Word + Excel)
- GET  /api/health               - Health check

The service uses CrewAI with 4 sequential AI agents:
1. Company Existence Validation  - Verifies the company exists via authoritative sources
2. DCF Input Data Collection     - Gathers historical financials, WACC, balance sheet data
3. DCF Calculation               - Builds 10-year DCF model with scenarios and sensitivity analysis
4. Validation & Realism Audit    - Audits assumptions, cross-checks metrics, flags issues

After all 4 agents complete successfully, the service:
- Extracts structured JSON data from agent outputs using an additional OpenAI call
- Generates a Word document (valuation_report.docx) with professional formatting
- Generates a single-sheet Excel file (dcf_10_year_forecast.xlsx) with the full DCF model
- Bundles both into a ZIP archive for download

Requires a valid OpenAI API key configured in the Settings page of the Angular UI.

Dependencies (requirements.txt):
- flask==3.0.0
- flask-cors==4.0.0
- openai>=1.68.0
- crewai>=0.100.1
- crewai-tools>=0.36.0
- openpyxl>=3.1.2
- python-docx>=1.1.0
