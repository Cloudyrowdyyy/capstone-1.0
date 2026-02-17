#!/usr/bin/env python3
import bcrypt

password1 = "admin123"
password2 = "user123"

hash1 = bcrypt.hashpw(password1.encode(), bcrypt.gensalt(10)).decode()
hash2 = bcrypt.hashpw(password2.encode(), bcrypt.gensalt(10)).decode()

print(f"admin/admin123: {hash1}")
print(f"user/user123: {hash2}")

# Verify they work
print(f"\nVerification:")
print(f"admin123 matches: {bcrypt.checkpw(password1.encode(), hash1.encode())}")
print(f"user123 matches: {bcrypt.checkpw(password2.encode(), hash2.encode())}")
