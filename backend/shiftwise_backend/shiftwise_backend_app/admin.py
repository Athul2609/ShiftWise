# scheduler/admin.py

from django.contrib import admin
from .models import Doctor, Team, OffRequest

admin.site.register(Doctor)
admin.site.register(Team)
admin.site.register(OffRequest)
