# Generated by Django 4.2.16 on 2024-10-16 08:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shiftwise_backend_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='offrequest',
            unique_together={('doctor', 'date')},
        ),
    ]
