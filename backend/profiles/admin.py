from django.contrib import admin
from .models import User, Profile, JobExperience, Project, Education

admin.site.register(User)
admin.site.register(Profile)
admin.site.register(JobExperience)
admin.site.register(Project)
admin.site.register(Education)