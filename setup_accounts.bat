@echo off
REM Script to setup test accounts
REM Run from: d:\Capstone 1.0

cd /d "d:\Capstone 1.0\backend-rust"

echo Clearing existing accounts...
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_system -c "DELETE FROM verifications; DELETE FROM users;"

echo Creating admin account...
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_system -c "INSERT INTO users (id, email, username, password, role, full_name, phone_number, verified) VALUES ('admin-001', 'admin@gmail.com', 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeS86pLvQO5YsbS', 'admin', 'System Administrator', '+63-900-000-0001', TRUE);"

echo Creating user account...
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_system -c "INSERT INTO users (id, email, username, password, role, full_name, phone_number, license_number, license_expiry_date, verified) VALUES ('user-001', 'user@gmail.com', 'user', '$2b$10$jrCMPSDjEXRYrJWJDvzR/.bP4n4gXHTJ.jhHEIvmQ2MXjDr5gOzaG', 'guard', 'Test User', '+63-900-000-0002', 'LIC-2025-001', '2027-12-31', TRUE);"

echo.
echo Verifying accounts...
docker exec guard-firearm-postgres psql -U postgres -d guard_firearm_system -c "SELECT username, email, role FROM users;"

echo.
echo =======================================
echo Setup Complete!
echo =======================================
echo Admin: admin / admin123
echo User: user / user123
echo =======================================

pause
