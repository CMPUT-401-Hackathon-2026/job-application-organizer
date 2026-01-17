# Job Application Organizer - Frontend

A modern React + TypeScript frontend for managing job applications, built with Vite, TailwindCSS, and React Router.

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router** for routing
- **TanStack React Query** for server state management
- **Zustand** for client state management
- **lucide-react** for icons

## Getting Started

### Prerequisites

- Node.js 20.19.0 or higher (or 22.12.0+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or similar port).

### Building for Production

Build the production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the `frontend` directory with:

```env
VITE_API_BASE_URL=/api
```

- `VITE_API_BASE_URL`: Base URL for API requests (defaults to `/api` which proxies to Django backend at `http://127.0.0.1:8000`)

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and mock data
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── index.html          # HTML template
```

## Features

- **Authentication**: Login with email/password or Google (UI only)
- **Profile Management**: Complete profile setup with education, experience, projects, tech stack, and links
- **Job Search**: Search and browse jobs with LinkedIn-style split view
- **Resume Builder**: Build and edit resumes with ATS scanning
- **Application Tracking**: Track application status and communications
- **Theme Toggle**: Light/dark mode with localStorage persistence
- **Responsive Design**: Works on desktop and mobile devices

## API Integration

The app uses a fallback pattern: API calls attempt to reach the Django backend at `/api`, but fall back to mock data if the request fails. This allows the frontend to work independently during development.

See `src/api/index.ts` for all available API functions.

## Running with Backend

When running with the Django backend:

1. Start the Django server on port 8000:
```bash
cd backend
python manage.py runserver
```

2. Start the Vite dev server:
```bash
cd frontend
npm run dev
```

The frontend will proxy API requests from `/api` to `http://127.0.0.1:8000/api`.
