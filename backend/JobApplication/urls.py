from django.urls import path
from .views import JobApplicationAPIView, JobDetailAPIView

urlpatterns = [
    # GET /api/jobs/?q=search_term - List/search jobs
    path("", JobApplicationAPIView.as_view(), name="job-list"),
    
    # GET /api/jobs/123/ - Get specific job details
    path("<int:job_id>/", JobDetailAPIView.as_view(), name="job-detail"),
]