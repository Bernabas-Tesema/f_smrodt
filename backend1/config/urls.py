"""
SMROD AIOT TECH — Root URL Configuration
OpenAPI, DRF API v1 endpoints for all modular applications.
"""
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)


def home(_request):
    return HttpResponse(
        """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SMROD Backend</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Georgia, "Times New Roman", serif;
      background:
        radial-gradient(circle at top left, #e8deff 0%, transparent 45%),
        linear-gradient(160deg, #f7f4ff 0%, #efe8ff 40%, #f8fafc 100%);
      color: #1a1228;
    }
    main {
      width: min(560px, 92vw);
      text-align: center;
    }
    h1 {
      margin: 0 0 0.4rem;
      font-size: clamp(2rem, 5vw, 2.8rem);
      letter-spacing: 0.02em;
      color: #6A00FF;
    }
    p {
      margin: 0.55rem 0;
      line-height: 1.5;
      color: #3b3350;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 1.5rem;
    }
    a {
      display: inline-block;
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      text-decoration: none;
      font-family: system-ui, sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
    }
    a.primary {
      background: #6A00FF;
      color: #fff;
    }
    a.secondary {
      background: #fff;
      color: #6A00FF;
      border: 1px solid #cbb8ff;
    }
  </style>
</head>
<body>
  <main>
    <h1>SMROD Backend</h1>
    <p>This is the API server for the SMROD / VSCU-100 project.</p>
    <p>Admin frontend: <strong>f-smrodt.vercel.app</strong></p>
    <p>Use the API docs or <code>/api/v1/</code> endpoints — this root page is only a status landing.</p>
    <div class="links">
      <a class="primary" href="/api/docs/">API Docs</a>
      <a class="secondary" href="https://f-smrodt.vercel.app/">Open Frontend</a>
    </div>
  </main>
</body>
</html>
""",
        content_type="text/html",
    )


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),

    # OpenAPI Schema & Interactive Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # API v1 Endpoints
    path("api/v1/vehicles/", include("apps.vehicles.urls", namespace="vehicles")),
    path("api/v1/ai/", include("apps.ai_engine.urls", namespace="ai")),
]
