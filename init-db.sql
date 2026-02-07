-- Initialize databases for GoTogether services
CREATE DATABASE IF NOT EXISTS gotogether;

USE gotogether;

-- Grant privileges to root user (already has all privileges, but explicitly stated for clarity)
GRANT ALL PRIVILEGES ON gotogether.* TO 'root'@'%';

-- Optional: Create separate databases for each service if needed
-- CREATE DATABASE IF NOT EXISTS gotogether_user;
-- CREATE DATABASE IF NOT EXISTS gotogether_booking;
-- CREATE DATABASE IF NOT EXISTS gotogether_ride;
-- CREATE DATABASE IF NOT EXISTS gotogether_vehicle;

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;
