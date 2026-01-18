from django.db import models
from django.utils import timezone


class Application(models.Model):
    profile = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="applications",
        null=True,
        blank=True
    )

    job = models.ForeignKey(
        "JobApplication.JobApplication",
        on_delete=models.CASCADE,
        related_name="applications",
        null=True,
        blank=True
    )

    class Stage(models.TextChoices):
        DRAFT = "draft", "Draft"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTION = "rejection", "Rejection"
        WITHDRAWN = "withdrawn", "Withdrawn"

    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.DRAFT,
    )

    date_applied = models.DateField(null=True, blank=True)
    duration_days = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



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
