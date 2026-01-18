from django.urls import path
from .views import JobApplicationAPIView, JobDetailAPIView

urlpatterns = [
    path("jobs/", JobApplicationAPIView.as_view(), name="job-list"),
    path("jobs/<int:job_id>/", JobDetailAPIView.as_view(), name="job-detail"),
]