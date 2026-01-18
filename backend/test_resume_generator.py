import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from resumes.resume_generator import ResumeGeneratorService

# Detailed dummy profile data
profile_data = {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "programmingLanguages": ["Python", "JavaScript", "TypeScript", "C++", "SQL"],
    "frameworks": ["Django", "React", "Node.js", "Express", "Flask"],
    "libraries": ["NumPy", "Pandas", "TensorFlow", "Redux", "Jest"],
    "experience": [
        {
            "company": "Tech Innovations Inc",
            "position": "Full Stack Developer",
            "startDate": "2023-01",
            "endDate": "Present",
            "description": [
                "Developed and maintained 5+ web applications using Django and React",
                "Improved application performance by 40% through code optimization",
                "Collaborated with cross-functional teams of 10+ members",
                "Implemented RESTful APIs serving 100K+ daily requests"
            ]
        },
        {
            "company": "StartupXYZ",
            "position": "Junior Software Engineer",
            "startDate": "2021-06",
            "endDate": "2022-12",
            "description": [
                "Built responsive frontend components using React and TypeScript",
                "Wrote unit tests achieving 85% code coverage",
                "Participated in code reviews and agile ceremonies"
            ]
        }
    ],
    "projects": [
        {
            "name": "E-commerce Platform",
            "description": "Full-stack e-commerce application with payment integration",
            "technologies": ["Django", "React", "PostgreSQL", "Stripe API", "Redis"],
            "url": "https://github.com/sarahj/ecommerce-platform"
        },
        {
            "name": "AI Chatbot",
            "description": "Machine learning chatbot using natural language processing",
            "technologies": ["Python", "TensorFlow", "Flask", "Docker"],
            "url": "https://github.com/sarahj/ai-chatbot"
        }
    ],
    "education": [
        {
            "school": "University of Technology",
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "startDate": "2017-09",
            "endDate": "2021-05",
            "description": "GPA: 3.8/4.0"
        }
    ]
}

job_description = """
Senior Backend Developer - Tech Company

Required Skills:
- 3+ years of professional experience with Python and Django
- Strong understanding of RESTful API design
- Experience with PostgreSQL
- Proficiency in writing tests
- Familiarity with cloud platforms

Responsibilities:
- Design and develop scalable backend services
- Write clean, maintainable code
- Collaborate with frontend developers
"""

# Generate resume
print("Generating tailored resume... (this may take 10-30 seconds)\n")
service = ResumeGeneratorService()
result = service.generate_resume(profile_data, job_description)
print("=" * 80)
print("GENERATED RESUME:")
print("=" * 80)
print(result)