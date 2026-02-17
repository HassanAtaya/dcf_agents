import json
from typing import Any, Dict, List


# ═══════════════════════════════════════════════════════════════
#  STRUCTURED DATA EXTRACTION (post-agent JSON extraction)
# ═══════════════════════════════════════════════════════════════

EXTRACTION_PROMPT = """You are a financial data extraction specialist.
Given the complete DCF analysis output from 4 agents, extract ALL numerical
and textual data into the exact JSON structure below.

CRITICAL RULES:
- All monetary values must be numbers (not strings), in millions USD unless stated otherwise.
- All percentages must be plain numbers (e.g., 12.5 for 12.5%, NOT 0.125).
- If a value is truly missing, use null.
- The forecast array must have exactly 10 years (2026-2035).
- Do NOT invent data. Extract only what is present in the agent outputs.
- Return ONLY valid JSON, nothing else.

Required JSON structure:
{
  "company_name": "string",
  "ticker": "string or null",
  "country": "string",
  "industry": "string",
  "analysis_date": "YYYY-MM-DD",
  "method_summary": "string - 2-3 sentence professional DCF explanation",
  "assumptions": {
    "revenue_growth_rates": "string describing growth rate assumptions",
    "margin_assumptions": "string describing margin assumptions",
    "wacc": number,
    "terminal_growth_rate": number,
    "exit_multiple": number or null,
    "tax_rate": number,
    "risk_free_rate": number,
    "beta": number,
    "equity_risk_premium": number
  },
  "forecast": [
    {
      "year": 2026,
      "revenue": number,
      "revenue_growth_pct": number,
      "ebit_margin_pct": number,
      "ebit": number,
      "tax_rate": number,
      "nopat": number,
      "depreciation_amortization": number,
      "capex": number,
      "change_nwc": number,
      "fcff": number,
      "discount_factor": number,
      "pv_fcf": number
    }
  ],
  "terminal_value": number,
  "pv_terminal_value": number,
  "enterprise_value": number,
  "net_debt": number,
  "equity_value": number,
  "shares_outstanding": number,
  "intrinsic_value_per_share": number,
  "sensitivity": [
    {"wacc": number, "growth": number, "value_per_share": number}
  ],
  "risk_notes": ["string"],
  "validation_status": "Validated / Adjusted & Validated / Rejected",
  "validation_notes": ["string"]
}"""


def extract_structured_data(
    client: Any,
    company_name: str,
    all_results: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Call OpenAI to extract structured JSON from the combined agent outputs."""
    combined = '\n\n'.join([
        f"=== AGENT {r['agent']}: {r['name']} ===\n{r['result']}"
        for r in all_results
    ])

    response = client.chat.completions.create(
        model='gpt-4.1-mini',
        messages=[
            {'role': 'system', 'content': EXTRACTION_PROMPT},
            {'role': 'user', 'content': f'Company analyzed: {company_name}\n\nFull agent outputs:\n{combined}'},
        ],
        temperature=0,
        max_tokens=8000,
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)

