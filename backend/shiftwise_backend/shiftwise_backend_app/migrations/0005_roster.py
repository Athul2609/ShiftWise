# Generated by Django 4.2.16 on 2025-01-15 17:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shiftwise_backend_app', '0004_doctor_no_of_consecutive_night_shifts_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Roster',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.IntegerField()),
                ('day_shift_doctors', models.JSONField(default=list)),
                ('night_shift_doctors', models.JSONField(default=list)),
            ],
        ),
    ]
