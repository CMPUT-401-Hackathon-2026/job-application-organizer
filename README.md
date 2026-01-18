# Job Application Organizer

A comprehensive full-stack web application designed to streamline and organize your job search process. Track applications, manage your professional profile, generate resumes, and leverage AI-powered features to enhance your job application workflow.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure Firebase-based authentication system
- **Profile Management**: Complete professional profile with education, work experience, projects, and technical skills
- **Job Application Tracking**: Track applications through multiple stages (Draft, Applied, Interview, Offer, Rejection, Withdrawn)
- **Response Tracking**: Log and manage responses from employers (emails, calls, interviews, offers, rejections)
- **Job Search**: Search and discover job opportunities
- **Resume Generation**: Generate professional resumes in LaTeX format
- **AI-Powered Features**: Integration with OpenRouter API (DeepSeek) for intelligent job application assistance

### User Experience
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Real-time Updates**: Efficient data fetching with React Query
- **State Management**: Centralized state management with Zustand
- **Protected Routes**: Secure route protection with profile completeness checks

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **TanStack React Query** - Server state management
- **Zustand** - Global state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Firebase SDK** - Client-side Firebase integration

### Backend
- **Django 5.0** - High-level Python web framework
- **Django REST Framework** - Powerful toolkit for building Web APIs
- **Firebase Admin SDK** - Server-side Firebase authentication
- **SQLite** - Lightweight database (production can use PostgreSQL)
- **CORS Headers** - Cross-origin resource sharing support
- **OpenRouter API** - AI model integration for intelligent features

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+**
- **Node.js 18+** and npm
- **Firebase Project** with Authentication enabled
- **OpenRouter API Key** (optional, for AI features)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-application-organizer
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=backend/firebase-key.json

# OpenRouter API (Optional - for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here
API_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=deepseek/deepseek-r1

# Django Secret Key (for production)
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### 5. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Download your service account key JSON file
4. Place it in the `backend` directory as `firebase-key.json`
5. Update your Firebase configuration in the frontend Firebase config file

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```
The backend will be available at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Serve with Django:**
```bash
cd backend
python manage.py collectstatic --noinput
python manage.py runserver
```

## 📁 Project Structure

```
job-application-organizer/
├── backend/                 # Django backend application
│   ├── applications/        # Application tracking models and views
│   ├── auth_app/           # Firebase authentication
│   ├── config/             # Django project settings
│   ├── JobApplication/     # Job posting models
│   ├── profiles/           # User profile management
│   ├── resumes/            # Resume generation functionality
│   ├── manage.py           # Django management script
│   └── db.sqlite3          # SQLite database (development)
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── App.tsx        # Main application component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/verify/` - Verify Firebase token
- `POST /auth/login/` - User login

### Profile
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `POST /api/profile/education/` - Add education entry
- `DELETE /api/profile/education/{id}/` - Remove education entry
- Similar endpoints for job experiences and projects

### Applications
- `GET /api/applications/` - List all applications
- `POST /api/applications/` - Create new application
- `GET /api/applications/{id}/` - Get application details
- `PUT /api/applications/{id}/` - Update application
- `DELETE /api/applications/{id}/` - Delete application

### Job Applications
- `GET /api/jobs/` - List job postings
- `POST /api/jobs/` - Create job posting
- `GET /api/jobs/{id}/` - Get job details

### Resumes
- `GET /api/resumes/` - List user resumes
- `POST /api/resumes/generate/` - Generate resume

## 🎯 Usage

### Getting Started

1. **Create an Account**: Navigate to `/auth` and sign up using Firebase authentication
2. **Complete Your Profile**: Add your education, work experience, and projects
3. **Search for Jobs**: Use the search page to find job opportunities
4. **Track Applications**: Create applications and track them through different stages
5. **Generate Resumes**: Build and download professional resumes based on your profile

### Application Stages

- **Draft**: Initial application being prepared
- **Applied**: Application submitted to employer
- **Interview**: Interview stage (phone, technical, final)
- **Offer**: Job offer received
- **Rejection**: Application rejected
- **Withdrawn**: Application withdrawn by candidate

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- OpenRouter for AI API access
- Django and React communities for excellent documentation and tools

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ to help job seekers stay organized and successful in their job search journey.**
