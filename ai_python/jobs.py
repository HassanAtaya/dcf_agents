import logging
from typing import Any, Dict

logger = logging.getLogger('dcf_pipeline')


# In-memory job store shared across the app and pipeline
jobs: Dict[str, Dict[str, Any]] = {}


def check_cancelled(job_id: str) -> bool:
    """Return True if the job was cancelled and mark final state."""
    job = jobs.get(job_id)
    if not job:
        return True
    if job.get('cancelled'):
        logger.info('[Job %s] Job was cancelled by user. Stopping pipeline.', job_id[:8])
        job['status'] = 'cancelled'
        job['current_agent_name'] = 'Cancelled by user'
        return True
    return False

