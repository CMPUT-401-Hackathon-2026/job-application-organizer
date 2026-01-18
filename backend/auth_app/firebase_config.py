import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    try:
        # Try to get existing app
        _firebase_app = firebase_admin.get_app()
        logger.info("Firebase app already initialized")
        return _firebase_app
    except ValueError:
        # App doesn't exist, initialize it
        pass

    # Check for credentials file path
    cred_path = getattr(settings, 'FIREBASE_CREDENTIALS', None)
    logger.info(f"Looking for Firebase credentials at: {cred_path}")

    if cred_path and os.path.exists(cred_path):
        # Use service account credentials file
        logger.info(f"Found Firebase credentials file, initializing...")
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully with credentials file")
    else:
        # Try to use Application Default Credentials (for cloud environments)
        # Or initialize without credentials (limited functionality)
        logger.warning(f"Firebase credentials file not found at: {cred_path}")
        try:
            _firebase_app = firebase_admin.initialize_app()
            logger.info("Firebase initialized with default credentials")
        except Exception as e:
            logger.error(f"Firebase initialization failed: {e}")
            return None

    return _firebase_app


def verify_firebase_token(id_token):
    """
    Verify Firebase ID token and return decoded token data.
    Returns None if verification fails.
    """
    if not id_token:
        logger.warning("No ID token provided for verification")
        return None

    # Ensure Firebase is initialized
    app = initialize_firebase()

    if app is None:
        logger.error("Firebase not initialized, cannot verify token")
        return None

    try:
        logger.debug(f"Verifying Firebase token (first 20 chars): {id_token[:20]}...")
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        logger.info(f"Token verified successfully for user: {decoded_token.get('email')}")
        return {
            'uid': decoded_token.get('uid'),
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture'),
            'email_verified': decoded_token.get('email_verified', False),
        }
    except auth.ExpiredIdTokenError:
        logger.warning("Firebase token has expired")
        return None
    except auth.RevokedIdTokenError:
        logger.warning("Firebase token has been revoked")
        return None
    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase token: {e}")
        return None
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        return None
