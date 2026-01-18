from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet
from JobApplication.views import JobApplicationAPIView, JobDetailAPIView

# Create router for viewsets
router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

# URL patterns
urlpatterns = [
    # Viewset routes (list, create, retrieve, update, destroy)
    path('', include(router.urls)),
    
    # Job endpoints
    path('jobs/', JobApplicationAPIView.as_view(), name='job-list'),
    path('jobs/<int:job_id>/', JobDetailAPIView.as_view(), name='job-detail'),
]