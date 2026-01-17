from rest_framework import serializers
from .models import Profile, Education, JobExperience, Project

class EducationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    # Direct mapping now that model has these fields
    degree = serializers.CharField(allow_blank=True, required=False)
    field = serializers.CharField(source='field_of_study', allow_blank=True, required=False)

    startDate = serializers.DateField(source='start_date', format="%Y-%m-%d", input_formats=["%Y-%m-%d", "ISO-8601"], required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', format="%Y-%m-%d", input_formats=["%Y-%m-%d", "ISO-8601"], required=False, allow_null=True)
    description = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = ['id', 'school', 'degree', 'field', 'startDate', 'endDate', 'description']

    def get_description(self, obj):
        # Combining extras into a description for the frontend
        parts = []
        if obj.courses: parts.append(f"Courses: {', '.join(obj.courses)}")
        if obj.awards: parts.append(f"Awards: {', '.join(obj.awards)}")
        return ' | '.join(parts)


class ExperienceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    position = serializers.CharField(source='title')
    startDate = serializers.DateField(source='start_date', format="%Y-%m-%d", input_formats=["%Y-%m-%d", "ISO-8601"], required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', format="%Y-%m-%d", input_formats=["%Y-%m-%d", "ISO-8601"], required=False, allow_null=True)
    description = serializers.SerializerMethodField()

    class Meta:
        model = JobExperience
        fields = ['id', 'company', 'position', 'startDate', 'endDate', 'description']

    def get_description(self, obj):
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


class ProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    name = serializers.SerializerMethodField()  # Compute the name from related User
    email = serializers.EmailField(source='user.email')

    # Nested serializers for related fields (use related_name sources)
    education = EducationSerializer(many=True, source='educations', required=False)
    experience = ExperienceSerializer(many=True, source='job_experiences', required=False)
    projects = ProjectSerializer(many=True, required=False)

    # Writable fields for tech stack
    programmingLanguages = serializers.JSONField(source='programming_languages', required=False)
    # Provide a backwards-compatible field name the frontend expects
    techStack = serializers.JSONField(source='programming_languages', required=False)
    frameworks = serializers.JSONField(required=False)
    libraries = serializers.JSONField(required=False)

    # Frontend expects 'links' — we don't have a model field yet, return empty list by default
    links = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'name', 'email', 'education', 'experience', 'projects',
            'programmingLanguages', 'techStack', 'frameworks', 'libraries', 'links'
        ]

    def get_name(self, obj):
        # Access first_name and last_name from the related User instance
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def get_links(self, obj):
        return []

    def update(self, instance, validated_data):
        # Update nested fields and tech stack
        # Note: validated_data will contain keys named for the Profile model (programming_languages, frameworks, ...)
        education_data = validated_data.pop('educations', [])
        experience_data = validated_data.pop('job_experiences', [])
        projects_data = validated_data.pop('projects', [])

        # Update tech stack fields
        instance.programming_languages = validated_data.get('programming_languages', instance.programming_languages)
        instance.frameworks = validated_data.get('frameworks', instance.frameworks)
        instance.libraries = validated_data.get('libraries', instance.libraries)
        instance.save()

        # Update nested fields
        for edu in education_data:
            # edu may include an 'id' key coming from the frontend; map it to the PK if present
            edu_id = edu.get('id')
            if edu_id:
                Education.objects.update_or_create(profile=instance, pk=edu_id, defaults={
                    'school': edu.get('school', ''),
                    'degree': edu.get('degree', ''),
                    'field_of_study': edu.get('field', ''),
                    'start_date': edu.get('startDate'),
                    'end_date': edu.get('endDate'),
                    'courses': edu.get('courses', []),
                })
            else:
                Education.objects.create(profile=instance, school=edu.get('school', ''))

        for exp in experience_data:
            exp_id = exp.get('id')
            if exp_id:
                JobExperience.objects.update_or_create(profile=instance, pk=exp_id, defaults={
                    'company': exp.get('company', ''),
                    'title': exp.get('position', ''),
                    'start_date': exp.get('startDate'),
                    'end_date': exp.get('endDate'),
                    'description': '\n'.join(exp.get('description', [])) if isinstance(exp.get('description', []), list) else exp.get('description', ''),
                })
            else:
                JobExperience.objects.create(profile=instance, company=exp.get('company', ''))

        for proj in projects_data:
            proj_id = proj.get('id')
            if proj_id:
                Project.objects.update_or_create(profile=instance, pk=proj_id, defaults={
                    'title': proj.get('name', ''),
                    'description': proj.get('description', ''),
                    'skills': proj.get('technologies', []),
                    'github_link': proj.get('url', ''),
                })
            else:
                Project.objects.create(profile=instance, title=proj.get('name', ''))

        return instance
