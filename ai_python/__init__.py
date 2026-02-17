"""
ai_python package

Contains the FastAPI DCF pipeline service, split into:
- main: FastAPI app and HTTP routes
- pipeline: CrewAI pipeline orchestration
- reports: Word/Excel/ZIP report generation
- extraction: structured JSON extraction via OpenAI
- jobs: in-memory job store shared across modules
"""

