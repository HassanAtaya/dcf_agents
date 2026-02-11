APPLICATION WORKFLOW OVERVIEW
=============================

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
4. The system runs 4 AI agents sequentially:
   - Agent 1: Verifies the company exists.
   - Agent 2: Collects financial data for DCF inputs.
   - Agent 3: Builds a 10-year DCF model with scenarios.
   - Agent 4: Validates and audits the entire analysis.
5. Progress is shown in real-time with status indicators.
6. If any agent fails, the process stops and shows the error.
7. On success, click "Download Excel Report" to get the DCF analysis.
8. The Excel file contains 5 sheets:
   - Company Summary
   - Input Data
   - Forecast Model
   - Valuation Summary
   - Validation Notes


MENU VISIBILITY VS PERMISSIONS
------------------------------
Sidebar menu items are shown only if the user has at least one related permission:

- Permissions: add_permission, edit_permission, delete_permission
- Roles:       add_role, edit_role, delete_role
- Users:       add_user, edit_user, delete_user
- Settings:    edit_settings
- DCF:         use_dcf


MULTI-LANGUAGE SUPPORT
----------------------
The application supports three languages:
- English (default)
- French (FranÃ§ais)
- Arabic (Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©) - with full RTL layout support

Users can change their language in the Profile page. The language preference
is saved to the database and applied automatically on login.


SUMMARY
-------
A new admin workflow is:
- Log in with default credentials.
- Update profile and language preference.
- Configure AI settings (API key and agent prompts).
- Manage permissions, roles, and users.
- Run DCF analysis and download Excel reports.
