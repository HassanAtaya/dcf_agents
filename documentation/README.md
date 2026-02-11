DCF PRODUCTION - APPLICATION WORKFLOW OVERVIEW
===============================================

ABOUT THE PROJECT
-----------------
DCF Production is a full-stack financial analysis tool that performs
Discounted Cash Flow (DCF) valuations using AI-powered agents.
The application orchestrates four sequential CrewAI agents (powered by OpenAI)
to verify a company, collect financial data, build a 10-year DCF model,
and validate the results. The output is a downloadable ZIP archive
containing a professional Word document report and a single-sheet Excel
forecast file.

Technology stack:
- Frontend:  Angular 17 + PrimeNG (standalone components, lazy routing)
- Backend:   Java 21 / Spring Boot 3.2.0 (REST API, Spring Security, Flyway)
- AI Service: Python 3.11 / Flask + CrewAI (multi-agent pipeline)
- Database:  MySQL 8.0 (schema: dcf_ai)
- Docker:    Docker Compose v2, Nginx Alpine


LOGIN
-----
URL:
- Local:  http://localhost:4200
- Docker: http://localhost:14200

Default Admin Credentials:
- Username: admin
- Password: 123456


PROFILE (USER PREFERENCES)
--------------------------
1. After login, click the user icon in the top-right header to open the Profile page.
2. In Profile:
   - First Name / Last Name: enter values and click Save.
   - New Password: fill only if you want to change it; leave empty to keep the current password.
   - Language: choose English, French, or Arabic. Arabic enables RTL layout.
3. Click Save.
4. The profile is updated and cached. Language preference is applied immediately.


PERMISSIONS MANAGEMENT
----------------------
1. Open Permissions from the left sidebar.
2. View all permissions in the system.
3. Add Permission: Click "+" icon, enter a name, and Save.
4. Edit Permission: Click pencil icon, modify name, and Save.
5. Delete Permission: Click trash icon and confirm.


ROLES MANAGEMENT
----------------
1. Open Roles to see all roles and their assigned permissions.
2. Add Role: Click "Add Role", enter name, select permissions, Save.
3. Edit Role: Click pencil icon (except ADMIN). Update and Save.
4. Delete Role: Click trash icon and confirm. ADMIN is protected.


USERS MANAGEMENT
----------------
1. Open Users to see all application users and their roles.
2. Add User: Click "Add User", fill in username, password, name, role, language. Save.
3. Edit User: Click pencil icon (admin user cannot be edited). Update fields. Save.
4. Delete User: Click trash icon for non-admin users and confirm.


SETTINGS (AI CONFIGURATION)
----------------------------
1. Open Settings from the left sidebar.
2. Configure:
   - API Key: paste your OpenAI API key (e.g. sk-proj-...).
   - Agent 1 Prompt: Company Existence Validation agent instructions.
   - Agent 2 Prompt: DCF Input Data Collection agent instructions.
   - Agent 3 Prompt: DCF Calculation agent instructions.
   - Agent 4 Prompt: Validation & Realism Audit agent instructions.
3. Click Save Settings.


DCF ANALYSIS
------------
1. Open DCF from the left sidebar.
2. Enter a company name (e.g., "CACC - Credit Acceptance Corporation").
3. Click "GO" to start the analysis.
4. The system runs 4 AI agents sequentially via CrewAI:
   - Agent 1: Verifies the company exists via authoritative sources.
   - Agent 2: Collects historical financials, balance sheet, WACC components, etc.
   - Agent 3: Builds a 10-year DCF model with base/conservative/optimistic scenarios.
   - Agent 4: Validates and audits the entire analysis for realism.
5. Progress is shown in real-time with status indicators for each agent.
6. If any agent fails, the process stops and shows the error message.
7. On success, click "Download Report" to get a ZIP archive containing:
   - valuation_report.docx  : A professionally structured Word document explaining
     the valuation results, key assumptions, sensitivity analysis, and risk notes.
   - dcf_10_year_forecast.xlsx : A single-sheet Excel file with the full 10-year
     DCF forecast model, terminal value, enterprise value, and intrinsic value per share.
8. The ZIP filename follows the pattern: companyname_valuation_YYYYMMDD.zip


KPI DASHBOARD
-------------
1. Open KPI Dashboard from the left sidebar.
2. Every successful DCF report download is automatically logged with:
   - Date of analysis
   - Username who performed the analysis
   - Company name analyzed
   - Brief description (concise summary from AI results, max ~50 words)
   - Validation status (Validated / Adjusted & Validated / Rejected)
3. The dashboard displays:
   - Summary cards: Total Analyses, Validated count, Unique Companies
   - Charts: Status Breakdown (donut), Monthly Analyses (bar), Top Companies (donut)
   - Detailed logs table with pagination
4. Click "View More" on any row to see the full description in a dialog.


MENU VISIBILITY VS PERMISSIONS
------------------------------
Sidebar menu items are shown only if the user has at least one related permission:

- Permissions:    add_permission, edit_permission, delete_permission
- Roles:          add_role, edit_role, delete_role
- Users:          add_user, edit_user, delete_user
- Settings:       edit_settings
- DCF:            use_dcf
- KPI Dashboard:  view_kpi


MULTI-LANGUAGE SUPPORT
----------------------
The application supports three languages:
- English (default)
- French (Francais)
- Arabic - with full RTL layout support

Users can change their language in the Profile page. The language preference
is saved to the database and applied automatically on login.


SUMMARY
-------
A typical admin workflow is:
1. Log in with default credentials (admin / 123456).
2. Update profile and language preference.
3. Configure AI settings (OpenAI API key and four agent prompts).
4. Manage permissions, roles, and users as needed.
5. Run DCF analysis and download the ZIP report (Word + Excel).
6. Review analysis history on the KPI Dashboard.
