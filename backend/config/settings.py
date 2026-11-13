"""
SMROD AIOT TECH — Django Backend Settings
Architecture: Modular Monolith
Auth: Supabase Auth JWT verification
Database: PostgreSQL
IoT: MQTT over TLS 1.3
Real-time: Django Channels (WebSockets)
Async/Cache: Redis & Celery
"""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    os.environ.get('DJANGO_SECRET_KEY', 'smrod-dev-insecure-key-replace-in-production'),
)
DEBUG = os.environ.get('DEBUG', os.environ.get('DJANGO_DEBUG', 'False')) == 'True'

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if host.strip()
]
render_hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)
extra_hosts = os.environ.get('EXTRA_ALLOWED_HOSTS', '')
for host in extra_hosts.split(','):
    host = host.strip()
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

INSTALLED_APPS = [
    # Jazzmin must come before django.contrib.admin
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'channels',

    # SMROD Modular Monolith Applications (SAS-001 & WDS-001)
    'apps.accounts',
    'apps.vehicles',
    'apps.devices',
    'apps.security_events',
    'apps.commands',
    'apps.telemetry',
    'apps.locations',
    'apps.geofences',
    'apps.emergencies',
    'apps.notifications',
    'apps.risk_scoring',
    'apps.audit_logs',
    'apps.dashboard',
    'apps.ai_engine',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Prefer Render/DATABASE_URL. Fall back to explicit Postgres vars, then SQLite for local work.
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
elif os.getenv('DB_ENGINE', 'sqlite') == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'smrod_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Django REST Framework & Supabase JWT Authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.accounts.authentication.SupabaseJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
        if DEBUG
        else 'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# Supabase Auth Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://your-project.supabase.co')
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', 'your-supabase-jwt-secret')
# New secret key (sb_secret_...) — server-only; bypasses RLS. Not a JWT signing secret.
SUPABASE_SECRET_KEY = os.getenv('SUPABASE_SECRET_KEY', '')


# MQTT Broker (SAS-001: ESP32-S3 devices communicate directly via mTLS)
MQTT_BROKER_HOST = os.getenv('MQTT_BROKER_HOST', 'mqtt.smrod.ai')
MQTT_BROKER_PORT = int(os.getenv('MQTT_BROKER_PORT', '8883'))
MQTT_TLS_CA_CERT = os.getenv('MQTT_TLS_CA_CERT', '/etc/smrod/certs/ca.crt')

# Redis, Channels, and Celery. Docker Compose publishes Redis on localhost:6379.
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6380'))
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', CELERY_BROKER_URL)
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Email delivery. For Gmail, use an app password rather than the account password.
EMAIL_BACKEND = os.getenv(
    'EMAIL_BACKEND',
    'django.core.mail.backends.smtp.EmailBackend',
)
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '25'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'False') == 'True'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv(
    'DEFAULT_FROM_EMAIL',
    EMAIL_HOST_USER or 'webmaster@localhost',
)

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(REDIS_HOST, REDIS_PORT)],
        },
    },
}

# CORS Configuration for Admin Web Frontend + Flutter Web (random localhost ports)
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,https://smrod.site',
    ).split(',')
    if origin.strip()
]
# Flutter `flutter run -d chrome` uses a changing localhost port — allow in DEBUG.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
else:
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r'^http://localhost:\d+$',
        r'^http://127\.0\.0\.1:\d+$',
    ]

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Relax password rules in local DEBUG so simple admin passwords work
if DEBUG:
    AUTH_PASSWORD_VALIDATORS = []

# ---------------------------------------------------------------------------
# Jazzmin — polished Django Admin UI
# ---------------------------------------------------------------------------
JAZZMIN_SETTINGS = {
    'site_title': 'SMROD Admin',
    'site_header': 'SMROD AIOT',
    'site_brand': 'SMROD Control',
    'welcome_sign': 'SMROD vehicle security operations',
    'copyright': 'SMROD AIOT TECH',
    'search_model': ['auth.User', 'vehicles.Vehicle', 'devices.VSCUDevice'],
    'topmenu_links': [
        {'name': 'API Docs', 'url': '/api/docs/', 'new_window': True},
        {'name': 'AI Overview', 'url': '/api/v1/ai/overview/', 'new_window': True},
        {'name': 'Admin Web', 'url': 'http://localhost:5173', 'new_window': True},
    ],
    'show_sidebar': True,
    'navigation_expanded': True,
    'hide_apps': [],
    'order_with_respect_to': [
        'vehicles',
        'devices',
        'ai_engine',
        'auth',
    ],
    'icons': {
        'auth': 'fas fa-users-cog',
        'auth.user': 'fas fa-user',
        'auth.Group': 'fas fa-users',
        'vehicles.Vehicle': 'fas fa-car',
        'devices.VSCUDevice': 'fas fa-microchip',
        'ai_engine.AIProviderConfig': 'fas fa-brain',
        'ai_engine.AIPrediction': 'fas fa-exclamation-triangle',
        'ai_engine.VehicleRiskScore': 'fas fa-shield-alt',
        'ai_engine.AIInferenceLog': 'fas fa-chart-line',
    },
    'default_icon_parents': 'fas fa-folder',
    'default_icon_children': 'fas fa-circle',
    'related_modal_active': True,
    'custom_css': None,
    'custom_js': None,
    'use_google_fonts_cdn': True,
    'show_ui_builder': False,
    'changeform_format': 'horizontal_tabs',
}

JAZZMIN_UI_TWEAKS = {
    'navbar_small_text': False,
    'footer_small_text': False,
    'body_small_text': False,
    'brand_small_text': False,
    'brand_colour': 'navbar-dark',
    'accent': 'accent-info',
    'navbar': 'navbar-dark navbar-primary',
    'no_navbar_border': False,
    'navbar_fixed': True,
    'layout_boxed': False,
    'footer_fixed': False,
    'sidebar_fixed': True,
    'sidebar': 'sidebar-dark-primary',
    'sidebar_nav_small_text': False,
    'sidebar_disable_expand': False,
    'sidebar_nav_child_indent': True,
    'sidebar_nav_compact_style': False,
    'sidebar_nav_legacy_style': False,
    'sidebar_nav_flat_style': False,
    'theme': 'darkly',
    'dark_mode_theme': 'darkly',
    'button_classes': {
        'primary': 'btn-primary',
        'secondary': 'btn-secondary',
        'info': 'btn-info',
        'warning': 'btn-warning',
        'danger': 'btn-danger',
        'success': 'btn-success',
    },
}
