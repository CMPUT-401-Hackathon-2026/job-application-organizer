from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user so authentication is handled properly by Django (hashed passwords).
    """
    email = models.EmailField(unique=True)

    # Keep default username login (simplest for hackathon)
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username


class Profile(models.Model):
    """
    Stores the user's professional profile data (non-auth).
    Arrays are stored as JSON lists (works with SQLite and PostgreSQL).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    location = models.CharField(max_length=120, blank=True)

    programming_languages = models.JSONField(default=list, blank=True)
    frameworks = models.JSONField(default=list, blank=True)
    libraries = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile"


class JobExperience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="job_experiences")

    company = models.CharField(max_length=120)
    title = models.CharField(max_length=120)

    skills = models.JSONField(default=list, blank=True)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    location = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_current", "-start_date"]

    def __str__(self):
        return f"{self.company} - {self.title}"


class Project(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="projects")

    title = models.CharField(max_length=160)
    github_link = models.URLField(blank=True)

    skills = models.JSONField(default=list, blank=True)

    event = models.CharField(max_length=120, blank=True)  # e.g., "nwHacks 2026"
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Education(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="educations")

    school = models.CharField(max_length=180)
    location = models.CharField(max_length=120, blank=True)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    courses = models.JSONField(default=list, blank=True)
    clubs = models.JSONField(default=list, blank=True)
    awards = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_current", "-start_date"]

    def __str__(self):
        return self.school
