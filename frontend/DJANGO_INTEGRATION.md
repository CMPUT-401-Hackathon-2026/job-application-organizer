# Django Integration Guide

This document outlines the changes made and requirements for integrating the React frontend with Django backend.

## Changes Made for Django Compatibility

### 1. Authentication Token Handling ✅
- **File**: `frontend/src/api/client.ts`
- **Change**: Added automatic `Authorization: Bearer <token>` header to all API requests
- **Django Requirement**: Django REST Framework expects tokens in this format
- **Auto-logout**: Added 401 handling to clear tokens and redirect to login

### 2. Error Handling ✅
- **File**: `frontend/src/api/client.ts`
- **Change**: Improved error parsing to handle Django's error response format
- **Supports**: `detail`, `message`, or `error` fields in error responses

## Django Backend Requirements

### 1. CORS Configuration
Django needs to allow requests from the frontend. Add to `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# For development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",
]

# For production, configure appropriately
CORS_ALLOW_CREDENTIALS = True
```

### 2. API Endpoints Expected

The frontend expects these endpoints (all under `/api` prefix):

#### Authentication
- `POST /api/auth/login` - Login with email/password
  - Request: `{ "email": string, "password": string }`
  - Response: `{ "token": string, "user": User }`
  
- `POST /api/auth/signup` - Create account
  - Request: `{ "email": string, "name": string, "password": string }`
  - Response: `{ "token": string, "user": User }`
  
- `POST /api/auth/google` - Google OAuth (optional)
  - Response: `{ "token": string, "user": User }`

#### Profile
- `GET /api/profile` - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `Profile` object
  
- `PUT /api/profile` - Update user profile
  - Headers: `Authorization: Bearer <token>`
  - Request: `Profile` object
  - Response: `Profile` object

#### Jobs
- `GET /api/jobs/search?q=<query>` - Search jobs
  - Response: `Job[]`
  
- `GET /api/jobs/<id>` - Get job details
  - Response: `Job` object

#### Applications
- `GET /api/applications` - List user's applications
  - Headers: `Authorization: Bearer <token>`
  - Response: `Application[]`
  
- `POST /api/applications` - Create application
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ "jobId": string, "status": ApplicationStatus }`
  - Response: `Application` object
  
- `PATCH /api/applications/<id>/status` - Update application status
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ "status": ApplicationStatus }`
  - Response: `Application` object

#### Resume
- `POST /api/resume/build` - Build resume for application
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ "applicationId": string }`
  - Response: `Resume` object
  
- `PATCH /api/resume/<applicationId>` - Update resume
  - Headers: `Authorization: Bearer <token>`
  - Request: `Partial<Resume>`
  - Response: `Resume` object
  
- `GET /api/resume/<applicationId>/latex` - Download LaTeX resume
  - Headers: `Authorization: Bearer <token>`
  - Response: `application/x-latex` blob
  
- `GET /api/resume/<applicationId>/ats-scan` - Get ATS score
  - Headers: `Authorization: Bearer <token>`
  - Response: `ATSResult` object

#### Communications
- `GET /api/applications/<applicationId>/communications` - List communications
  - Headers: `Authorization: Bearer <token>`
  - Response: `Communication[]`
  
- `POST /api/applications/<applicationId>/communications` - Add communication
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ "type": string, "content": string }`
  - Response: `Communication` object
  
- `POST /api/applications/<applicationId>/communications/generate-reply` - Generate reply
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ "context"?: string }`
  - Response: `{ "reply": string }`

### 3. Response Formats

All responses should be JSON. Error responses should follow this format:

```json
{
  "detail": "Error message here"
}
```

Or:

```json
{
  "message": "Error message here"
}
```

Or:

```json
{
  "error": "Error message here"
}
```

### 4. Authentication

- Use Django REST Framework Token Authentication or JWT
- Tokens should be returned in the response body (not as cookies)
- Frontend stores tokens in `localStorage` as `auth_token`
- All authenticated endpoints require: `Authorization: Bearer <token>` header

### 5. TypeScript Types

The frontend expects these data structures (see `frontend/src/types/index.ts`):

- `User`: `{ id: string, name: string, email: string, avatar?: string }`
- `Profile`: See types file for full structure
- `Job`: See types file for full structure
- `Application`: See types file for full structure
- `Resume`: See types file for full structure
- `Communication`: See types file for full structure
- `ApplicationStatus`: `'Draft' | 'Applied' | 'Interview' | 'Offer' | 'Rejection' | 'Archived'`

### 6. Environment Variables

Frontend uses:
- `VITE_API_BASE_URL` (defaults to `/api`)

For production, set this to your Django API base URL.

### 7. Development Setup

The Vite dev server is configured to proxy `/api` requests to `http://127.0.0.1:8000` (Django default).

See `frontend/vite.config.ts` for proxy configuration.

### 8. Production Build

When building for production:
- Build frontend: `npm run build` in `frontend/` directory
- Django should serve the built files from `frontend/dist/`
- Configure Django to serve static files and route all non-API requests to `index.html` for React Router

## Testing Integration

1. Start Django backend on `http://127.0.0.1:8000`
2. Start frontend dev server: `npm run dev` in `frontend/`
3. Frontend will automatically use Django API when available
4. If Django API is unavailable, frontend falls back to mock data

## Notes

- All API calls have mock data fallbacks for development
- The frontend gracefully handles API failures
- Authentication tokens are automatically included in all requests
- 401 responses trigger automatic logout and redirect to login page
