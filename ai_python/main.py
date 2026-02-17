import uuid
import threading
import base64

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import io
import logging

from .jobs import jobs
from .pipeline import run_dcf_pipeline

# Configure logging once for the whole service
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger('dcf_pipeline')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
#  FASTAPI ROUTES
# ═══════════════════════════════════════════════════════════════

@app.post('/api/dcf/start')
def start_dcf(data: dict):
    """Start a DCF analysis pipeline."""
    if not data:
        raise HTTPException(status_code=400, detail='No data provided')

    company_name = data.get('company_name', '').strip()
    api_key = data.get('api_key', '').strip()
    prompts = data.get('prompts', {})

    if not company_name:
        raise HTTPException(status_code=400, detail='Company name is required')
    if not api_key or api_key == 'NO_KEY':
        raise HTTPException(status_code=400, detail='Please configure a valid OpenAI API key in Settings.')

    job_id = str(uuid.uuid4())
    logger.info('New DCF job started: %s for company "%s"', job_id[:8], company_name)
    jobs[job_id] = {
        'status': 'running',
        'current_agent': 1,
        'current_agent_name': 'Company Existence Validation',
        'agent_results': [],
        'error': None,
        'download_ready': False,
        'zip_data': None,
        'zip_filename': None,
        'company_name': company_name,
        'cancelled': False,
    }

    thread = threading.Thread(
        target=run_dcf_pipeline,
        args=(job_id, company_name, api_key, prompts)
    )
    thread.daemon = True
    thread.start()

    return {'job_id': job_id}


@app.get('/api/dcf/status/{job_id}')
def dcf_status(job_id: str):
    """Get the status of a DCF analysis job."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')

    return {
        'status': job['status'],
        'current_agent': job['current_agent'],
        'current_agent_name': job['current_agent_name'],
        'agent_results': job['agent_results'],
        'error': job['error'],
        'download_ready': job['download_ready'],
        'zip_filename': job.get('zip_filename'),
        'cancelled': job.get('cancelled', False),
    }


@app.post('/api/dcf/cancel/{job_id}')
def dcf_cancel(job_id: str):
    """Request cancellation of a running DCF analysis job."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')

    job['cancelled'] = True
    # Mark job as cancelled immediately from API point of view.
    if job.get('status') == 'running':
        job['status'] = 'cancelled'
        job['current_agent_name'] = 'Cancelled by user'

    logger.info('Cancellation requested for job %s', job_id[:8])
    return {
        'status': job['status'],
        'current_agent': job['current_agent'],
        'current_agent_name': job['current_agent_name'],
        'agent_results': job['agent_results'],
        'error': job['error'],
        'download_ready': job['download_ready'],
        'zip_filename': job.get('zip_filename'),
        'cancelled': True,
    }


@app.get('/api/dcf/download/{job_id}')
def dcf_download(job_id: str):
    """Download the ZIP file for a completed DCF analysis."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')

    if not job.get('download_ready') or not job.get('zip_data'):
        raise HTTPException(status_code=404, detail='Download is not ready yet')

    zip_bytes = base64.b64decode(job['zip_data'])
    filename = job.get('zip_filename', 'dcf_valuation.zip')

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type='application/zip',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )


@app.get('/api/health')
def health():
    return {'status': 'UP'}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=5000)
