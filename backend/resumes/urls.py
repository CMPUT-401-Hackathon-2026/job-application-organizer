from django.urls import path
from . import views

urlpatterns = [
    # Get or update resume data
    path(
        "applications/<int:app_id>/resume/",
        views.application_resume,
        name="application_resume"
    ),
    
    # Build resume from profile + job description using DeepSeek
    path(
        "applications/<int:app_id>/resume/build/",
        views.build_application_resume,
        name="build_application_resume"
    ),
    
    # ATS scan using Gemini
    path(
        "applications/<int:app_id>/resume/ats-scan/",
        views.resume_ats_scan,
        name="resume_ats_scan"
    ),
    
    # Download LaTeX file
    path(
        "applications/<int:app_id>/resume/latex/",
        views.resume_download_latex,
        name="resume_download_latex"
    ),
    
    # Download compiled PDF
    path(
        "applications/<int:app_id>/resume/pdf/",
        views.resume_download_pdf,
        name="resume_download_pdf"
    ),
]