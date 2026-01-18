from rest_framework import serializers
from .models import Application
from JobApplication.serializers import JobApplicationSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobApplicationSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "stage",
            "date_applied",
            "created_at",
            "job",
        ]

