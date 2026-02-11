ANGULAR FRONTEND SETUP
======================

Prerequisites:
- Node.js 18+
- npm 9+

Steps:
1. Navigate to: front_end_angular/
2. Install dependencies: npm install
3. Start dev server: npx ng serve --port 4200
4. Open http://localhost:4200

Build for Production / Docker:
  npx ng build --configuration production
  Output: dist/dcf-production/browser/

Features:
- Standalone Angular 17 components (no NgModules)
- PrimeNG UI library with PrimeIcons
- Lazy-loaded routes with permission-based guards
- Multi-language support (English, French, Arabic with RTL)
- HTTP Basic authentication
- Real-time DCF agent progress polling
- Chart.js integration for KPI dashboard (donut + bar charts)
- Responsive layout with sidebar navigation

Pages:
- Login            : Authentication page
- Profile          : User settings (name, password, language)
- Permissions      : CRUD management for permissions
- Roles            : CRUD management for roles with permission assignment
- Users            : CRUD management for users with role assignment
- Settings         : Configure OpenAI API key and 4 agent prompts
- DCF              : Run AI-powered DCF analysis and download reports
- KPI Dashboard    : View analysis history, charts, and statistics
