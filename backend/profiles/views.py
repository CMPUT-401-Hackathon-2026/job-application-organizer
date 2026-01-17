from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Profile, Education, JobExperience, Project
from .serializers import ProfileSerializer


class ProfileView(APIView):
    """
    GET /api/profile/ - Get current user's profile
    PUT /api/profile/ - Update current user's profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        data = request.data

        # Update user fields
        if 'name' in data:
            # Split name into first and last
            name_parts = data['name'].split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
            user.save()

        # Ensure profile exists
        profile, created = Profile.objects.get_or_create(user=user)

        # Update profile tech fields
        if 'programmingLanguages' in data:
            profile.programming_languages = data['programmingLanguages']
        if 'frameworks' in data:
            profile.frameworks = data['frameworks']
        if 'libraries' in data:
            profile.libraries = data['libraries']
        if 'techStack' in data:
            # techStack is a combination, split into categories if needed
            pass

        profile.save()

        # Handle education updates
        if 'education' in data:
            # Clear existing and recreate
            profile.educations.all().delete()
            for edu in data['education']:
                Education.objects.create(
                    profile=profile,
                    school=edu.get('school', ''),
                    start_date=edu.get('startDate', '2020-01-01'),
                    end_date=edu.get('endDate') if edu.get('endDate') else None,
                    is_current=edu.get('endDate') is None,
                    courses=[edu.get('field', '')],
                )

        # Handle experience updates
        if 'experience' in data:
            profile.job_experiences.all().delete()
            for exp in data['experience']:
                description = exp.get('description', [])
                if isinstance(description, list):
                    description = '\n'.join(description)
                JobExperience.objects.create(
                    profile=profile,
                    company=exp.get('company', ''),
                    title=exp.get('position', ''),
                    start_date=exp.get('startDate', '2020-01-01'),
                    end_date=exp.get('endDate') if exp.get('endDate') else None,
                    is_current=exp.get('endDate') is None,
                    description=description,
                )

        # Handle projects updates
        if 'projects' in data:
            profile.projects.all().delete()
            for proj in data['projects']:
                Project.objects.create(
                    profile=profile,
                    title=proj.get('name', ''),
                    description=proj.get('description', ''),
                    skills=proj.get('technologies', []),
                    github_link=proj.get('url', ''),
                )

        serializer = ProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
