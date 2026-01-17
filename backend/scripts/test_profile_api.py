import os
import sys
import django
import json

# Ensure the backend package is on sys.path so 'config' can be imported
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from profiles.models import Profile
from rest_framework.test import APIRequestFactory, force_authenticate
from profiles.views import ProfileView

User = get_user_model()

# Create or get test user
email = 'test+api@example.com'
username = 'test_api_user'
user, created = User.objects.get_or_create(email=email, defaults={'username': username})
if created:
    user.set_password('password')
    user.save()

# Create/update profile
profile, _ = Profile.objects.get_or_create(user=user)
profile.programming_languages = ['Python', 'Django']
profile.frameworks = ['DRF']
profile.libraries = ['requests']
profile.save()

# Make request to view
factory = APIRequestFactory()
request = factory.get('/api/profile/')
force_authenticate(request, user=user)

view = ProfileView.as_view()
response = view(request)

print('STATUS:', response.status_code)
print(json.dumps(response.data, indent=2, default=str))
