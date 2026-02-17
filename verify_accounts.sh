#!/bin/bash
# Verify test accounts were created
cd /d/Capstone\ 1.0/backend-rust
echo "=== Checking users in database ==="
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_db << EOF
SELECT username, email, role FROM users;
EOF
echo ""
echo "=== Test complete ==="
