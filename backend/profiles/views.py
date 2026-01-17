from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from dateutil import parser # Recommended: pip install python-dateutil
from .models import Profile, Education, JobExperience, Project
from .serializers import ProfileSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure Profile exists and serialize the Profile instance
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        # Helper to safely parse dates (returns None if invalid or empty)
        def parse_date_safe(date_str):
            if not date_str: return None
            try:
                return parser.parse(date_str).date()
            except:
                return None

        try:
            with transaction.atomic():
                # 1. Update User Basic Info
                if 'name' in data:
                    name_parts = data['name'].strip().split(' ', 1)
                    user.first_name = name_parts[0]
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                    user.save()

                # 2. Update Profile Tech Stack
                profile, _ = Profile.objects.get_or_create(user=user)

                if 'programmingLanguages' in data:
                    profile.programming_languages = data['programmingLanguages']
                if 'frameworks' in data:
                    profile.frameworks = data['frameworks']
                if 'libraries' in data:
                    profile.libraries = data['libraries']

                profile.save()

                # 3. Update Education (Delete all & Recreate strategy)
                if 'education' in data:
                    profile.educations.all().delete()
                    for edu in data['education']:
                        Education.objects.create(
                            profile=profile,
                            school=edu.get('school', ''),
                            degree=edu.get('degree', ''),
                            field_of_study=edu.get('field', ''),
                            start_date=parse_date_safe(edu.get('startDate')),
                            end_date=parse_date_safe(edu.get('endDate')),
                            is_current=not edu.get('endDate'),
                            # If description contains extra info, store it in courses for now
                            courses=[edu.get('description', '')] if edu.get('description') else []
                        )

                # 4. Update Experience
                if 'experience' in data:
                    profile.job_experiences.all().delete()
                    for exp in data['experience']:
                        # Handle description array -> string
                        desc_input = exp.get('description', [])
                        desc_text = '\n'.join(desc_input) if isinstance(desc_input, list) else str(desc_input)

                        JobExperience.objects.create(
                            profile=profile,
                            company=exp.get('company', ''),
                            title=exp.get('position', ''),
                            start_date=parse_date_safe(exp.get('startDate')),
                            end_date=parse_date_safe(exp.get('endDate')),
                            is_current=not exp.get('endDate'),
                            description=desc_text
                        )

                # 5. Update Projects
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

            # Return updated profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error saving profile: {e}")
            return Response(
                {"error": "Failed to save profile", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        user = request.user
        data = request.data

        # Helper to safely parse dates (returns None if invalid or empty)
        def parse_date_safe(date_str):
            if not date_str: return None
            try:
                return parser.parse(date_str).date()
            except:
                return None

        try:
            with transaction.atomic():
                # Create Profile
                profile, created = Profile.objects.get_or_create(user=user)

                if 'programmingLanguages' in data:
                    profile.programming_languages = data['programmingLanguages']
                if 'frameworks' in data:
                    profile.frameworks = data['frameworks']
                if 'libraries' in data:
                    profile.libraries = data['libraries']

                profile.save()

                # Add Education
                if 'education' in data:
                    for edu in data['education']:
                        Education.objects.create(
                            profile=profile,
                            school=edu.get('school', ''),
                            degree=edu.get('degree', ''),
                            field_of_study=edu.get('field', ''),
                            start_date=parse_date_safe(edu.get('startDate')),
                            end_date=parse_date_safe(edu.get('endDate')),
                            is_current=not edu.get('endDate'),
                            courses=[edu.get('description', '')] if edu.get('description') else []
                        )

                # Add Experience
                if 'experience' in data:
                    for exp in data['experience']:
                        desc_input = exp.get('description', [])
                        desc_text = '\n'.join(desc_input) if isinstance(desc_input, list) else str(desc_input)

                        JobExperience.objects.create(
                            profile=profile,
                            company=exp.get('company', ''),
                            title=exp.get('position', ''),
                            start_date=parse_date_safe(exp.get('startDate')),
                            end_date=parse_date_safe(exp.get('endDate')),
                            is_current=not exp.get('endDate'),
                            description=desc_text
                        )

                # Add Projects
                if 'projects' in data:
                    for proj in data['projects']:
                        Project.objects.create(
                            profile=profile,
                            title=proj.get('name', ''),
                            description=proj.get('description', ''),
                            skills=proj.get('technologies', []),
                            github_link=proj.get('url', ''),
                        )

            # Return created profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error creating profile: {e}")
            return Response(
                {"error": "Failed to create profile", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
