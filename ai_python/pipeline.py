import base64
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict

from crewai import Agent, Task, Crew, Process
from openai import OpenAI

from .extraction import extract_structured_data
from .jobs import jobs, check_cancelled
from .reports import create_word, create_excel, create_zip


logger = logging.getLogger('dcf_pipeline')


def run_dcf_pipeline(job_id: str, company_name: str, api_key: str, prompts: Dict[str, Any]) -> None:
    """Run the 4 CrewAI agents sequentially, then generate ZIP (Word + Excel)."""
    try:
        os.environ['OPENAI_API_KEY'] = api_key
        client = OpenAI(api_key=api_key)
        logger.info('[Job %s] === DCF PIPELINE STARTED for "%s" ===', job_id[:8], company_name)

        if check_cancelled(job_id):
            return

        # ─── Agent 1: Company Existence Validation ───────────────────
        jobs[job_id]['current_agent'] = 1
        jobs[job_id]['current_agent_name'] = 'Company Existence Validation'
        logger.info('[Job %s] Agent 1 (Company Existence Validation) starting...', job_id[:8])

        agent1 = Agent(
            role='Company Existence Validator',
            goal=f'Verify if the company "{company_name}" exists and gather basic corporate info',
            backstory=prompts.get('agent1', 'You are a corporate intelligence verification agent.'),
            verbose=False,
            llm='gpt-4.1-mini',
        )
        task1 = Task(
            description=(
                f'Verify the existence and identity of the company: {company_name}. '
                f'Return structured information: Company Status [Exists / Does Not Exist / Uncertain], '
                f'exact legal name, ticker (if public), country, industry, official website, '
                f'and a 2-3 line factual description.\n\n'
                f'IMPORTANT RULES:\n'
                f'- For descriptive or marketing-style names (e.g., with slogans or long taglines), '
                f'assume the company may be real and search broadly (official website, business registries, '
                f'LinkedIn, credible directories, press releases).\n'
                f'- Use \"Does Not Exist\" ONLY when repeated, multi-source searching strongly indicates the entity '
                f'is fictional, a placeholder, or appears only in examples/training material.\n'
                f'- When evidence is sparse, ambiguous, or conflicting, prefer \"Uncertain\" and explain why.\n'
                f'- It is better to return \"Uncertain\" for a potentially real small/private company than to '
                f'incorrectly say \"Does Not Exist\".'
            ),
            agent=agent1,
            expected_output=(
                'Structured company verification report with status, legal name, '
                'ticker, country, industry, website, and description. Status must be clearly labeled as '
                '\"Company Status: [Exists/Does Not Exist/Uncertain]\".'
            ),
        )
        crew1 = Crew(agents=[agent1], tasks=[task1], process=Process.sequential, verbose=False)
        result1 = crew1.kickoff()
        result1_str = str(result1)

        logger.info('[Job %s] Agent 1 completed. Result length: %d chars', job_id[:8], len(result1_str))

        # Try to parse a structured Company Status from Agent 1 output.
        status = None
        try:
            m = re.search(
                r'Company Status\\s*[:\\-]\\s*\\[?(?P<status>[A-Za-z \\-/]+)\\]?',
                result1_str,
                re.IGNORECASE,
            )
            if m:
                status = m.group('status').strip().lower()
                logger.info('[Job %s] Agent 1 parsed status: %s', job_id[:8], status)
        except Exception as parse_err:
            logger.warning('[Job %s] Failed to parse Company Status from Agent 1 output: %s', job_id[:8], parse_err)

        # Stop the pipeline when Agent 1 cannot confidently confirm existence.
        # If status is "Does Not Exist" OR "Uncertain", we do NOT continue to the next agents.
        if status in ('does not exist', 'nonexistent', 'does-not-exist', 'uncertain'):
            logger.warning(
                '[Job %s] Agent 1: Company status is %s. Stopping pipeline before next agents.',
                job_id[:8],
                status,
            )
            jobs[job_id]['agent_results'].append({
                'agent': 1, 'name': 'Company Existence Validation', 'result': result1_str,
            })
            jobs[job_id]['status'] = 'error'
            safe_status = status or "Unknown"
            jobs[job_id]['error'] = (
                f'Company verification failed: The company "{company_name}" was marked as "{safe_status}" '
                'by the verification agent, so the DCF pipeline was stopped.'
            )
            return

        jobs[job_id]['agent_results'].append({
            'agent': 1, 'name': 'Company Existence Validation', 'result': result1_str,
        })

        if check_cancelled(job_id):
            return

        # ─── Agent 2: DCF Input Data Collection ─────────────────────
        jobs[job_id]['current_agent'] = 2
        jobs[job_id]['current_agent_name'] = 'DCF Input Data Collection'
        logger.info('[Job %s] Agent 2 (DCF Input Data Collection) starting...', job_id[:8])

        agent2 = Agent(
            role='Financial Data Collector',
            goal=f'Collect all required DCF input data for {company_name}',
            backstory=prompts.get('agent2', 'You are a senior financial analyst.'),
            verbose=False,
            llm='gpt-4.1-mini',
        )
        task2 = Task(
            description=(
                f'Using the verified company identity of {company_name}, collect all 5 critical '
                f'DCF input categories: '
                f'(1) 5+ years historical financials (revenue, EBITDA, EBIT, net income, FCF, growth, margins), '
                f'(2) balance sheet data (debt, cash, net debt, working capital, shares), '
                f'(3) reinvestment data (capex, D&A, WC trends), '
                f'(4) discount rate components (risk-free rate, beta, ERP, cost of debt, capital structure, WACC), '
                f'(5) terminal assumptions (GDP reference, industry growth, exit multiples). '
                f'Separate actual vs estimated data, list missing data and provide a data quality score.\n\n'
                f'Company verification info:\n{result1_str[:3000]}'
            ),
            agent=agent2,
            expected_output=(
                'Structured financial data with all 5 DCF input categories clearly separated, '
                'with data quality score.'
            ),
        )
        crew2 = Crew(agents=[agent2], tasks=[task2], process=Process.sequential, verbose=False)
        result2 = crew2.kickoff()
        result2_str = str(result2)

        logger.info('[Job %s] Agent 2 completed. Result length: %d chars', job_id[:8], len(result2_str))
        jobs[job_id]['agent_results'].append({
            'agent': 2, 'name': 'DCF Input Data Collection', 'result': result2_str,
        })

        if check_cancelled(job_id):
            return

        # ─── Agent 3: DCF Calculation ────────────────────────────────
        jobs[job_id]['current_agent'] = 3
        jobs[job_id]['current_agent_name'] = 'DCF Calculation'
        logger.info('[Job %s] Agent 3 (DCF Calculation) starting...', job_id[:8])

        agent3 = Agent(
            role='Valuation Modeling Expert',
            goal=f'Build a complete 10-year DCF model for {company_name}',
            backstory=prompts.get('agent3', 'You are a valuation modeling expert.'),
            verbose=False,
            llm='gpt-4.1-mini',
        )
        task3 = Task(
            description=(
                f'Using the collected financial inputs for {company_name}, build a complete '
                f'10-year DCF model (2026-2035). Follow strict rules: '
                f'(1) revenue forecast via historical CAGR with base/conservative/optimistic scenarios, '
                f'(2) margin forecast via trend logic, '
                f'(3) FCFF = EBIT*(1-Tax)+D&A-Capex-delta_NWC, '
                f'(4) discount each year using WACC, '
                f'(5) compute terminal value using both perpetual growth and exit multiple, '
                f'(6) bridge EV to equity via net debt, '
                f'(7) compute intrinsic value per share. '
                f'Output structured text tables for forecast, FCF, PV, terminal value, EV, '
                f'equity value, per-share value plus sensitivity analysis (WACC +/-1%, g +/-0.5%) '
                f'and clearly labeled final scenario results.\n\n'
                f'Financial input data:\n{result2_str[:4000]}'
            ),
            agent=agent3,
            expected_output=(
                'Complete DCF model with forecast tables, FCF calculations, PV, terminal value, '
                'EV, equity value, per-share value, and sensitivity analysis.'
            ),
        )
        crew3 = Crew(agents=[agent3], tasks=[task3], process=Process.sequential, verbose=False)
        result3 = crew3.kickoff()
        result3_str = str(result3)

        logger.info('[Job %s] Agent 3 completed. Result length: %d chars', job_id[:8], len(result3_str))
        jobs[job_id]['agent_results'].append({
            'agent': 3, 'name': 'DCF Calculation', 'result': result3_str,
        })

        if check_cancelled(job_id):
            return

        # ─── Agent 4: Validation & Realism Audit ────────────────────
        jobs[job_id]['current_agent'] = 4
        jobs[job_id]['current_agent_name'] = 'Validation & Realism Audit'
        logger.info('[Job %s] Agent 4 (Validation & Realism Audit) starting...', job_id[:8])

        agent4 = Agent(
            role='Financial Realism Auditor',
            goal=f'Audit and validate the DCF analysis for {company_name}',
            backstory=prompts.get('agent4', 'You are a financial realism audit agent.'),
            verbose=False,
            llm='gpt-4.1-mini',
        )
        task4 = Task(
            description=(
                f'Audit the DCF analysis for {company_name}. '
                f'Check growth realism vs GDP, margin consistency vs industry, reinvestment logic, '
                f'WACC/beta sanity, and terminal value dominance (<75% EV). '
                f'Independently recalculate key metrics, correct unrealistic assumptions if needed. '
                f'Return strictly structured machine-readable text formatted as: '
                f'Sheet 1 Company Summary, Sheet 2 Input Data, Sheet 3 Forecast Model, '
                f'Sheet 4 Valuation Summary (EV, Equity Value, Intrinsic Value/Share), '
                f'Sheet 5 Validation Notes (corrections, adjustments, risk flags), '
                f'with final status [Validated/Adjusted & Validated/Rejected].\n\n'
                f'Company verification:\n{result1_str[:1500]}\n\n'
                f'Financial data:\n{result2_str[:2500]}\n\n'
                f'DCF model:\n{result3_str[:4000]}'
            ),
            agent=agent4,
            expected_output=(
                'Structured audit report with 5 sections and final validation status '
                '[Validated / Adjusted & Validated / Rejected].'
            ),
        )
        crew4 = Crew(agents=[agent4], tasks=[task4], process=Process.sequential, verbose=False)
        result4 = crew4.kickoff()
        result4_str = str(result4)

        logger.info('[Job %s] Agent 4 completed. Result length: %d chars', job_id[:8], len(result4_str))

        if 'rejected' in result4_str.lower():
            logger.warning('[Job %s] Agent 4: Analysis REJECTED. Stopping pipeline.', job_id[:8])
            jobs[job_id]['agent_results'].append({
                'agent': 4, 'name': 'Validation & Realism Audit', 'result': result4_str,
            })
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = (
                'Validation agent rejected the analysis. See agent 4 results for details.'
            )
            return

        jobs[job_id]['agent_results'].append({
            'agent': 4, 'name': 'Validation & Realism Audit', 'result': result4_str,
        })

        if check_cancelled(job_id):
            return

        # ─── Extract structured data ────────────────────────────────
        jobs[job_id]['current_agent'] = 0
        jobs[job_id]['current_agent_name'] = 'Extracting structured data...'
        logger.info('[Job %s] All 4 agents done. Extracting structured JSON data...', job_id[:8])

        structured = extract_structured_data(client, company_name, jobs[job_id]['agent_results'])

        # ─── Generate Word + Excel + ZIP ────────────────────────────
        jobs[job_id]['current_agent_name'] = 'Generating reports...'
        logger.info('[Job %s] Generating Word document and Excel file...', job_id[:8])

        word_bytes = create_word(structured, company_name)
        excel_bytes = create_excel(structured)
        zip_bytes = create_zip(word_bytes, excel_bytes)

        # Dynamic filename: companyname_valuation_YYYYMMDD.zip
        raw = company_name.split('-')[0].strip() if '-' in company_name else company_name
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', raw)
        safe_name = re.sub(r'_+', '_', safe_name).strip('_').lower()
        date_str = datetime.now().strftime('%Y%m%d')
        zip_filename = f'{safe_name}_valuation_{date_str}.zip'

        jobs[job_id]['zip_data'] = base64.b64encode(zip_bytes).decode('utf-8')
        jobs[job_id]['zip_filename'] = zip_filename
        jobs[job_id]['download_ready'] = True
        jobs[job_id]['status'] = 'complete'
        jobs[job_id]['current_agent'] = 0
        jobs[job_id]['current_agent_name'] = 'Complete'
        logger.info('[Job %s] === PIPELINE COMPLETE. ZIP ready: %s ===', job_id[:8], zip_filename)

    except Exception as e:
        logger.error('[Job %s] PIPELINE FAILED: %s', job_id[:8], str(e), exc_info=True)
        jobs[job_id]['status'] = 'error'
        jobs[job_id]['error'] = str(e)

