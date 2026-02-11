-- =============================================
-- Seed Permissions (11 total)
-- =============================================
INSERT INTO permissions (name) VALUES ('add_permission');
INSERT INTO permissions (name) VALUES ('edit_permission');
INSERT INTO permissions (name) VALUES ('delete_permission');
INSERT INTO permissions (name) VALUES ('add_user');
INSERT INTO permissions (name) VALUES ('edit_user');
INSERT INTO permissions (name) VALUES ('delete_user');
INSERT INTO permissions (name) VALUES ('add_role');
INSERT INTO permissions (name) VALUES ('edit_role');
INSERT INTO permissions (name) VALUES ('delete_role');
INSERT INTO permissions (name) VALUES ('edit_settings');
INSERT INTO permissions (name) VALUES ('use_dcf');

-- =============================================
-- Seed ADMIN Role
-- =============================================
INSERT INTO roles (name) VALUES ('ADMIN');

-- =============================================
-- Give ADMIN role ALL permissions
-- =============================================
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 1);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 2);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 3);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 4);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 5);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 6);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 7);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 8);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 9);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 10);
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 11);

-- =============================================
-- Seed AI Settings
-- =============================================
INSERT INTO ai_settings (name, `key`, prompt_agent1, prompt_agent2, prompt_agent3, prompt_agent4) VALUES (
    'openai',
    'NO_KEY',
    'COMPANY EXISTENCE VALIDATION AGENT: You are a corporate intelligence verification agent; given a company name, search authoritative sources (official website, SEC/EDGAR, national registries, Bloomberg, Reuters, stock exchanges) to confirm existence and return strictly in text format: Company Status [Exists/Does Not Exist/Uncertain], Exact Legal Name, Ticker (if public), Country, Industry, Official Website, and a 2-3 line factual description, with no hallucinations and clear disambiguation if multiple entities exist.',
    'DCF INPUT DATA COLLECTION AGENT: You are a senior financial analyst; using verified company identity, collect from filings (10-K/10-Q), annual reports, investor presentations, earnings transcripts, and financial databases the 5 critical DCF input categories—(1) 5+ years historical financials (revenue, EBITDA, EBIT, net income, FCF, growth, margins), (2) balance sheet data (debt, cash, net debt, working capital, shares), (3) reinvestment data (capex, D&A, WC trends), (4) discount rate components (risk-free rate, beta, ERP, cost of debt, capital structure, WACC), (5) terminal assumptions (GDP reference, industry growth, exit multiples)—and return structured text sections clearly separating actual vs estimated data, listing missing data and a data quality score.',
    'DCF CALCULATION AGENT: You are a valuation modeling expert; using collected inputs, build a 10-year DCF (e.g., 2026-2035) following strict rules—(1) revenue forecast via historical CAGR with base/conservative/optimistic scenarios, (2) margin forecast via trend logic, (3) FCFF = EBIT*(1-Tax)+D&A-Capex-delta_NWC, (4) discount each year using WACC, (5) compute terminal value using both perpetual growth and exit multiple, (6) bridge EV to equity via net debt, (7) compute intrinsic value per share—and output structured text tables for forecast, FCF, PV, terminal value, EV, equity value, per-share value plus sensitivity (WACC +/-1%, g +/-0.5%) and clearly labeled final scenario results.',
    'VALIDATION & REALISM AUDIT AGENT: You are a financial realism audit agent; recheck prior agents'' outputs for growth realism vs GDP, margin consistency vs industry, reinvestment logic, WACC/beta sanity, and terminal value dominance (<75% EV), independently recalculate key metrics, correct unrealistic assumptions if needed, and return strictly structured machine-readable text formatted as Sheet 1 Company Summary, Sheet 2 Input Data, Sheet 3 Forecast Model, Sheet 4 Valuation Summary (EV, Equity Value, Intrinsic Value/Share), Sheet 5 Validation Notes (corrections, adjustments, risk flags), with final status [Validated/Adjusted & Validated/Rejected].'
);
