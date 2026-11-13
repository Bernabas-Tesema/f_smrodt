from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create or update the SMROD Django admin superuser.'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='bern@gmail.com')
        parser.add_argument('--password', default='12341234')
        parser.add_argument('--username', default='bern@gmail.com')

    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email']
        username = options['username']
        password = options['password']

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} admin user: {username}'))
