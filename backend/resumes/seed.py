#This is just to test is the data is loading correctly

from .models import Resume

def seed_resume():
    if Resume.objects.exists():
        return

    Resume.objects.create(
        title="Ayaan Mallick - Master Resume",
        data={
            "header": {
                "name": "Ayaan Mallick",
                "phone": "+1 780 995 5835",
                "email": "mallick1@ualberta.ca",
                "linkedin": "https://www.linkedin.com/in/ayaanmallick",
                "github": "https://github.com/AyaanMallick",
            },
            "education": [
                {
                    "institution": "University of Alberta",
                    "degree": "Bachelor of Science with Honors in Computing Science",
                    "location": "Edmonton, AB",
                    "dates": "Expected December 2026",
                    "bullets": [
                        "GPA: 3.8 / 4.0",
                        "Awards: Dean’s Honors Roll x2 (2023–2024, 2024–2025)",
                        "Relevant Coursework: Software Engineering, Databases, ML, AI",
                    ],
                }
            ],
            "experience": [],
            "projects": [],
            "skills": {
                "languages": "Java, Python, C/C++, SQL",
                "frameworks": "React, Django, Android SDK",
                "tools": "Git, Docker, GCP",
                "libraries": "NumPy, Pandas, TensorFlow",
            },
        },
    )
