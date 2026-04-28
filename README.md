# AutoService Manager Vue

AutoService Manager Vue is a Vue 3 frontend application for managing automotive service workflows.

It connects to the AutoService Manager API and provides user interfaces for customers, vehicles, technicians, service orders, and repair operations.

This project was built as a portfolio application to demonstrate frontend development, API integration, TypeScript usage, routing, form handling, and real-world workflow screens.

---

## Features

- Dashboard with module navigation
- Customer management
  - List customers
  - Create customers
  - Edit customers
  - Delete customers
  - Search customers
- Vehicle management
  - List vehicles
  - Create vehicles
  - Edit vehicles
  - Delete vehicles
  - Search vehicles
- Technician management
  - List technicians
  - Create technicians
  - Edit technicians
  - Deactivate technicians
  - Search technicians
- Service order workflow
  - Create service orders
  - View service orders
  - Update service order status
  - Close service orders
  - Display labor, parts, and total amounts
- Repair operations workflow
  - Load operations by open service order
  - Create operations
  - Edit operations
  - Delete operations
  - Display labor hours, labor rate, and labor amount
- API error handling
- Responsive layout
- Vue Router navigation
- Axios-based HTTP client
- Environment-based API configuration

---

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios
- CSS Grid / Responsive CSS
- ESLint
- Prettier

---

## Project Structure

```txt
src/
??? api/
?   ??? httpClient.ts
??? router/
?   ??? index.ts
??? services/
?   ??? customerService.ts
?   ??? vehicleService.ts
?   ??? technicianService.ts
?   ??? serviceOrderService.ts
?   ??? operationService.ts
??? utils/
?   ??? apiError.ts
??? views/
?   ??? HomeView.vue
?   ??? CustomersView.vue
?   ??? VehiclesView.vue
?   ??? TechniciansView.vue
?   ??? ServiceOrdersView.vue
?   ??? OperationsView.vue
??? App.vue
??? main.ts
API Integration

This frontend expects the AutoService Manager API to be running locally.

Example .env configuration:

VITE_API_BASE_URL=http://localhost:5184/api

Depending on how the backend is launched, the API may also run on HTTPS:

VITE_API_BASE_URL=https://localhost:44323/api

The app uses a centralized Axios HTTP client located at:

src/api/httpClient.ts
Getting Started
1. Clone the repository
git clone https://github.com/lasantosX/auto-service-manager-vue.git
cd auto-service-manager-vue
2. Install dependencies
npm install
3. Create the environment file

Create a .env file in the project root:

VITE_API_BASE_URL=http://localhost:5184/api

Adjust the URL if your backend is running on a different port.

4. Run the app
npm run dev

The app will usually run at:

http://localhost:5173
Available Scripts
npm run dev

Runs the app in development mode.

npm run build

Builds the app for production.

npm run preview

Previews the production build locally.

npm run lint

Runs linting checks.

npm run format

Formats the codebase.

Main Screens
Dashboard
Customers
Vehicles
Technicians
Service Orders
Operations
Backend Repository

This frontend is designed to work with the AutoService Manager API backend.

Backend repository:

https://github.com/lasantosX/AutoServiceManagerApi

Update this link if your backend repository uses a different name.

Future Improvements
Add authentication and authorization
Add pagination controls in the UI
Add toast notifications
Add unit tests
Add end-to-end tests
Add deployment pipeline
Add production hosting
Purpose

This project demonstrates a practical full-stack workflow using Vue 3 and ASP.NET Core Web API.

It focuses on real business-style screens, clean API integration, maintainable TypeScript services, and a modular frontend structure.

```
