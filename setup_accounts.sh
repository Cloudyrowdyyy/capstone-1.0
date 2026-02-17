#!/usr/bin/env bash

# Script to create test accounts in the database
# Uses bcrypt hashed passwords

cd /d/Capstone\ 1.0/backend-rust

echo "Deleting existing users..."
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_db << 'EOF'
DELETE FROM verifications;
DELETE FROM users;
EOF

echo "Creating admin account..."
# Password: admin123 (bcrypt hash)
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_db << 'EOF'
INSERT INTO users (id, email, username, password, role, full_name, phone_number, verified)
VALUES (
  'admin-001',
  'admin@gmail.com',
  'admin',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeS86pLvQO5YsbS',
  'admin',
  'System Administrator',
  '+63-900-000-0001',
  TRUE
);
EOF

echo "Creating user account..."
# Password: user123 (bcrypt hash)
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_db << 'EOF'
INSERT INTO users (id, email, username, password, role, full_name, phone_number, license_number, license_expiry_date, verified)
VALUES (
  'user-001',
  'user@gmail.com',
  'user',
  '$2b$10$jrCMPSDjEXRYrJWJDvzR/.bP4n4gXHTJ.jhHEIvmQ2MXjDr5gOzaG',
  'guard',
  'Test User',
  '+63-900-000-0002',
  'LIC-2025-001',
  '2027-12-31',
  TRUE
);
EOF

echo "Verifying accounts..."
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_db << 'EOF'
SELECT username, email, role FROM users;
EOF

echo ""
echo "======================================="
echo "Setup Complete!"
echo "======================================="
echo "Admin: admin / admin123"
echo "User: user / user123"
echo "======================================="
