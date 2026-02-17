import requests
import json
import subprocess

# Test admin login
print("=" * 50)
print("Testing Admin Login")
print("=" * 50)

admin_login = {
    "identifier": "admin",
    "password": "admin123"
}

try:
    resp = requests.post('http://localhost:5000/api/login', json=admin_login)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ Admin login successful")
        print(f"  Username: {data.get('user', {}).get('username')}")
        print(f"  Role: {data.get('user', {}).get('role')}")
    else:
        print(f"✗ Admin login failed: {resp.text}")
except Exception as e:
    print(f"✗ Error: {e}")

print()

# Test user login
print("=" * 50)
print("Testing User Login")
print("=" * 50)

user_login = {
    "identifier": "user",
    "password": "user123"
}

try:
    resp = requests.post('http://localhost:5000/api/login', json=user_login)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ User login successful")
        print(f"  Username: {data.get('user', {}).get('username')}")
        print(f"  Role: {data.get('user', {}).get('role')}")
    else:
        print(f"✗ User login failed: {resp.text}")
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("=" * 50)
print("Setup Complete!")
print("=" * 50)
print("Admin credentials: admin / admin123")
print("User credentials: user / user123")
