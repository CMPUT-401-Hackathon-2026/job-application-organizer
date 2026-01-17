from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .firebase_config import verify_firebase_token
from django.utils.crypto import get_random_string
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
        try:
            if email:
                user = User.objects.get(email=email)
                logger.info(f"Found existing user: {user.username}")
            else:
                user = User.objects.get(firebase_uid=uid)
                logger.info(f"Found existing user by firebase_uid: {user.username}")
        except User.DoesNotExist:
            # Auto-create user for Firebase authenticated users
            logger.info(f"Creating new user for email: {email}")
            username = email.split('@')[0] if email else f'user_{uid[:8]}'
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                email=email or f'{uid}@firebase.local',
                username=username,
                password=get_random_string(20),
                firebase_uid=uid,
            )
            logger.info(f"Created new user: {user.username}")

        return (user, token)

    def authenticate_header(self, request):
        return 'Bearer'
