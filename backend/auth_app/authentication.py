from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .firebase_config import verify_firebase_token
from django.utils.crypto import get_random_string
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)


class FirebaseAuthentication(BaseAuthentication):
    """
    Firebase token authentication for Django REST Framework.
    Expects: Authorization: Bearer <firebase_id_token>
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        logger.debug(f"Auth header present: {bool(auth_header)}")

        if not auth_header:
            logger.debug("No Authorization header found")
            return None  # No auth header, let other authenticators try

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != 'bearer':
            logger.warning(f"Invalid auth header format: {parts[0] if parts else 'empty'}")
            return None

        token = parts[1]
        logger.info(f"Attempting to verify Firebase token...")

        # Verify Firebase token
        decoded_token = verify_firebase_token(token)

        if not decoded_token:
            logger.error("Firebase token verification failed")
            raise AuthenticationFailed('Invalid Firebase token')

        # Get email from token
        email = decoded_token.get('email')
        uid = decoded_token.get('uid')
        logger.info(f"Token verified for email: {email}, uid: {uid}")

        if not email and not uid:
            logger.error("Token missing user info (no email or uid)")
            raise AuthenticationFailed('Token missing user info')

        # Get or create user
        User = get_user_model()

        # First, prefer finding by firebase_uid to avoid duplicates
        if uid:
            try:
                user = User.objects.get(firebase_uid=uid)
                logger.info(f"Found existing user by firebase_uid: {user.username}")
                # If email is present and differs, try to update it (best-effort)
                if email and user.email != email:
                    user.email = email
                    try:
                        user.save()
                    except IntegrityError:
                        logger.warning("Skipping email update due to unique constraint or race condition")
                return (user, token)
            except User.DoesNotExist:
                pass

        # Next, try finding by email (if provided)
        if email:
            try:
                user = User.objects.get(email=email)
                logger.info(f"Found existing user by email: {user.username}")
                # If the DB user doesn't have a firebase_uid yet, associate it (best-effort)
                if uid and not user.firebase_uid:
                    user.firebase_uid = uid
                    try:
                        user.save()
                    except IntegrityError:
                        # Another process may have added the firebase_uid concurrently; fetch that one
                        try:
                            user = User.objects.get(firebase_uid=uid)
                            logger.info("Another account claimed the firebase_uid concurrently; using that account")
                            return (user, token)
                        except User.DoesNotExist:
                            logger.warning("Failed to associate firebase_uid due to IntegrityError, but no user found afterwards")
                return (user, token)
            except User.DoesNotExist:
                pass

        # If we reached here, no user was found by uid or email — create one
        logger.info(f"Creating new user for email: {email}")
        username = email.split('@')[0] if email else f'user_{uid[:8]}'
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        try:
            user = User.objects.create_user(
                email=email or f'{uid}@firebase.local',
                username=username,
                password=get_random_string(20),
                firebase_uid=uid,
            )
            logger.info(f"Created new user: {user.username}")
            return (user, token)
        except IntegrityError:
            # Possible race: another process created the user with the same firebase_uid
            logger.warning("IntegrityError while creating user — attempting to recover by fetching existing user")
            try:
                user = User.objects.get(firebase_uid=uid)
                logger.info(f"Recovered existing user: {user.username}")
                return (user, token)
            except User.DoesNotExist:
                logger.exception("Failed to recover from IntegrityError while creating user")
                raise AuthenticationFailed('Unable to create or retrieve user')

    def authenticate_header(self, request):
        return 'Bearer'
