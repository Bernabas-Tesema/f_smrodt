from django.contrib import admin
from .models import NotificationPreference, NotificationLog


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('channel', 'email', 'profile', 'is_enabled', 'updated_at')
    list_filter = ('channel', 'is_enabled')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('channel', 'title', 'recipient', 'status', 'created_at')
    list_filter = ('channel', 'status')
    search_fields = ('title', 'recipient')
