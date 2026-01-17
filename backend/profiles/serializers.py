from rest_framework import serializers
from .models import Profile, Education, JobExperience, Project


class EducationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    degree = serializers.CharField(source='gpa', allow_blank=True, required=False)
    field = serializers.SerializerMethodField()
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date', allow_null=True, required=False)
    description = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = ['id', 'school', 'degree', 'field', 'startDate', 'endDate', 'description']

    def get_field(self, obj):
        # Return courses as field if available
        return ', '.join(obj.courses) if obj.courses else ''

    def get_description(self, obj):
        parts = []
        if obj.clubs:
            parts.append(f"Clubs: {', '.join(obj.clubs)}")
        if obj.awards:
            parts.append(f"Awards: {', '.join(obj.awards)}")
        return ' | '.join(parts) if parts else ''


class ExperienceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    position = serializers.CharField(source='title')
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date', allow_null=True, required=False)
    description = serializers.SerializerMethodField()

    class Meta:
        model = JobExperience
        fields = ['id', 'company', 'position', 'startDate', 'endDate', 'description']

    def get_description(self, obj):
        # Return description as list of lines
        if obj.description:
            return [line.strip() for line in obj.description.split('\n') if line.strip()]
        return []


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    name = serializers.CharField(source='title')
    technologies = serializers.JSONField(source='skills')
    url = serializers.URLField(source='github_link', allow_blank=True, required=False)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'technologies', 'url']


class ProfileSerializer(serializers.Serializer):
    """
    Serializer that matches frontend Profile interface
    """
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    email = serializers.EmailField()
    education = EducationSerializer(many=True, read_only=True, source='profile.educations')
    experience = ExperienceSerializer(many=True, read_only=True, source='profile.job_experiences')
    projects = ProjectSerializer(many=True, read_only=True, source='profile.projects')
    techStack = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    frameworks = serializers.JSONField(source='profile.frameworks', required=False, default=list)
    libraries = serializers.JSONField(source='profile.libraries', required=False, default=list)
    programmingLanguages = serializers.JSONField(source='profile.programming_languages', required=False, default=list)
    links = serializers.SerializerMethodField()

    def get_links(self, obj):
        # Return empty list for now, can be extended later
        return []

    def to_representation(self, instance):
        """
        instance is a User object
        """
        # Ensure profile exists
        if not hasattr(instance, 'profile'):
            Profile.objects.create(user=instance)
            instance.refresh_from_db()

        data = {
            'id': str(instance.pk),
            'name': instance.get_full_name() or instance.username,
            'email': instance.email,
            'education': EducationSerializer(instance.profile.educations.all(), many=True).data,
            'experience': ExperienceSerializer(instance.profile.job_experiences.all(), many=True).data,
            'projects': ProjectSerializer(instance.profile.projects.all(), many=True).data,
            'techStack': instance.profile.programming_languages + instance.profile.frameworks + instance.profile.libraries,
            'frameworks': instance.profile.frameworks,
            'libraries': instance.profile.libraries,
            'programmingLanguages': instance.profile.programming_languages,
            'links': [],
        }
        return data
