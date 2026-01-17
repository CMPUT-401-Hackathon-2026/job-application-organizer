from django.urls import path
from .views import JobApplicationAPIView

urlpatterns = [
    path("jobs/", JobApplicationAPIView.as_view()),
]
