from django.urls import path
from . import views

urlpatterns = [
    path("<str:app_id>/resume/", views.application_resume, name="application_resume"),
    path("<str:app_id>/resume/build/", views.build_application_resume, name="build_application_resume"),
    path("<str:app_id>/resume/ats-scan/", views.resume_ats_scan, name="resume_ats_scan"),
    path("<str:app_id>/resume/latex/", views.resume_download_latex, name="resume_download_latex"),
    path("<str:app_id>/resume/pdf/", views.resume_download_pdf, name="resume_download_pdf"),
]