PYTHON AI SERVICE SETUP
=======================

Prerequisites:
- Python 3.11+
- pip

Steps:
1. Navigate to: ai_python/
2. (Optional) Create virtual env: python -m venv venv && venv\Scripts\activate
3. Install dependencies: pip install -r requirements.txt
4. Run: python main.py
5. Service starts on http://localhost:5000

API Endpoints:
- POST /api/dcf/start            - Start DCF analysis pipeline
- GET  /api/dcf/status/<job_id>  - Get job status
- GET  /api/dcf/download/<job_id> - Download Excel report
- GET  /api/health               - Health check

The service uses CrewAI with 4 sequential AI agents:
1. Company Existence Validation
2. DCF Input Data Collection
3. DCF Calculation
4. Validation & Realism Audit

Requires a valid OpenAI API key configured in Settings.
