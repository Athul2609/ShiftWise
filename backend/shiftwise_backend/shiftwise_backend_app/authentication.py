import jwt
from django.conf import settings
from django.http import JsonResponse

def verify_jwt(request):
    token = request.COOKIES.get('jwt')  # Get the JWT from cookies

    if not token:
        return None  # No token found

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload['doctor_id']
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
