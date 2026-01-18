from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import Application, ApplicationResponse
from .serializers import ApplicationSerializer, ApplicationResponseSerializer
import logging

logger = logging.getLogger(__name__)


class ApplicationViewSet(ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated for now - change to IsAuthenticated later
    
    def get_queryset(self):
        """Show all applications"""
        return Application.objects.all().select_related('job', 'profile')
    
    def create(self, request, *args, **kwargs):
        """Override create to add logging"""
        logger.info(f"Creating application with data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating application: {str(e)}")
            raise
    
    def perform_create(self, serializer):
        """Save application"""
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def responses(self, request, pk=None):
        """Get all responses for an application"""
        application = self.get_object()
        responses = application.responses.all()
        serializer = ApplicationResponseSerializer(responses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        """Add a response to an application"""
        application = self.get_object()
        serializer = ApplicationResponseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(application=application)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)