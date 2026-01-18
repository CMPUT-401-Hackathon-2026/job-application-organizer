from rest_framework.viewsets import ModelViewSet
from .models import Application
from .serializers import ApplicationSerializer

class ApplicationViewSet(ModelViewSet):
    queryset = Application.objects.select_related("job")
    serializer_class = ApplicationSerializer
