import random
import string
from datetime import datetime, timedelta

import jwt
from django.conf import settings

# Utility function to generate a random OTP
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# Utility Function to generate JWT token
def generate_jwt(doctor):
    payload = {
        'doctor_id': doctor.doctor_id,
        'role':doctor.role,
        'exp': datetime.utcnow() + timedelta(hours=1),  # Token expiration time
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token