from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .firebase_config import initialize_firebase, verify_firebase_token

User = get_user_model()
initialize_firebase()


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Register a new user with email and password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'User registered successfully',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Login with email and Firebase ID token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            id_token = serializer.validated_data['id_token']

            # Verify Firebase token
            decoded_token = verify_firebase_token(id_token)
            if not decoded_token:
                return Response(
                    {'error': 'Invalid Firebase token'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Get or create user
            try:
                user = User.objects.get(email=email)
                user.firebase_uid = decoded_token.get('uid')
                user.save()
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    username=email,
                    firebase_uid=decoded_token.get('uid')
                )

            return Response(
                {
                    'message': 'Login successful',
                    'user': UserSerializer(user).data,
                    'token': id_token
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserView(APIView):
    """
    GET /api/auth/user/
    Get current authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )
