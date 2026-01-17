from django.db import models
from django.utils import timezone


class Application(models.Model):
    class Stage(models.TextChoices):
        DRAFT = "draft", "Draft"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTION = "rejection", "Rejection"
        WITHDRAWN = "withdrawn", "Withdrawn"

    title = models.CharField(max_length=200)  # position title (e.g., "Software Engineer Intern")
    company = models.CharField(max_length=200)

    link = models.URLField(blank=True)
    description = models.TextField(blank=True)

    location = models.CharField(max_length=200, blank=True)

    # "date" (posting date or when you found it)
    date = models.DateField(null=True, blank=True)

    date_applied = models.DateField(null=True, blank=True)

    # duration in days (or store a string like "4 months"; days is easier to query)
    duration_days = models.PositiveIntegerField(null=True, blank=True)

    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company} — {self.title}"


class ApplicationResponse(models.Model):
    """
    One Application can have many Responses (emails, calls, interview invites, rejection, etc.)
    """
    class ResponseType(models.TextChoices):
        EMAIL = "email", "Email"
        CALL = "call", "Call"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTION = "rejection", "Rejection"
        NOTE = "note", "Note"

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="responses"
    )

    response_type = models.CharField(
        max_length=20,
        choices=ResponseType.choices,
        default=ResponseType.NOTE,
    )

    received_at = models.DateTimeField(default=timezone.now)

    # log what happened / what they said
    summary = models.CharField(max_length=255)
    details = models.TextField(blank=True)

    # optional: who you spoke to / email address
    contact = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.application} [{self.response_type}]"

