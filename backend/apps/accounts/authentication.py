"""
apps.accounts.authentication
Validates incoming Bearer JWT tokens issued by Supabase Auth.
Separates administrative end-user identity from IoT device authentication.
"""

import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework import authentication, exceptions


class SupabaseUser:
    """Lightweight representation of an authenticated Supabase user in Django."""

    def __init__(self, payload: dict):
        self.id = payload.get('sub')
        self.email = payload.get('email', '')
        self.role = payload.get('role', 'authenticated')
        app_metadata = payload.get('app_metadata', {})
        self.smrod_role = app_metadata.get('role', 'viewer')
        self.is_authenticated = True

    def __str__(self):
        return f'{self.email} ({self.smrod_role})'


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """Verifies incoming requests with Authorization: Bearer <Supabase_JWT>."""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={'verify_aud': False},
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Supabase JWT token has expired')
        except jwt.InvalidTokenError as err:
            raise exceptions.AuthenticationFailed(f'Invalid Supabase JWT: {err}')

        user = SupabaseUser(payload)
        return (user, token)
