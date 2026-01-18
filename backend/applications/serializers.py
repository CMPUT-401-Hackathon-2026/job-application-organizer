from rest_framework import serializers
from .models import Application, ApplicationResponse
from JobApplication.serializers import JobApplicationSerializer


class ApplicationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationResponse
        fields = [
            "id",
            "response_type",
            "received_at",
            "summary",
            "details",
            "contact",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobApplicationSerializer(read_only=True)
    responses = ApplicationResponseSerializer(many=True, read_only=True)
    job_id = serializers.IntegerField(write_only=True)  # Accept job_id for creation
    stage = serializers.ChoiceField(choices=['draft', 'applied', 'interview', 'offer', 'rejection', 'withdrawn'])
    
    class Meta:
        model = Application
        fields = [
            "id",
            "job_id",  # For writing
            "stage",
            "date_applied",
            "created_at",
            "updated_at",
            "job",  # For reading (nested object)
            "responses",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "job", "responses"]

    def create(self, validated_data):
        """Override create to handle job_id properly"""
        job_id = validated_data.pop('job_id')
        # Ensure stage is lowercase
        validated_data['stage'] = validated_data.get('stage', 'draft').lower()
        application = Application.objects.create(job_id=job_id, **validated_data)
        return application

