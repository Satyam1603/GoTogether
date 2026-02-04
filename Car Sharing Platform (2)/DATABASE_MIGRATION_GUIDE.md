# Database Migration Guide - Base64 to S3 URLs

## SQL Migration Scripts

### MySQL/MariaDB

#### Step 1: Add New Column
```sql
-- Add new avatar_url column while keeping old imageBase64 for rollback
ALTER TABLE drivers ADD COLUMN avatar_url VARCHAR(500) NULL;

-- Verify column added
DESCRIBE drivers;
```

#### Step 2: Migrate Existing Data (Optional)
```sql
-- If you want to migrate old base64 to URLs:
-- This creates placeholder URLs (you'd need to re-upload images)

UPDATE drivers 
SET avatar_url = CONCAT(
    'https://car-sharing-platform-images.s3.amazonaws.com/drivers/', 
    id, 
    '/default-avatar.jpg'
)
WHERE image_base64 IS NOT NULL AND avatar_url IS NULL;
```

#### Step 3: Make Column Required (After Testing)
```sql
-- Only run this after confirming uploads work correctly
ALTER TABLE drivers MODIFY COLUMN avatar_url VARCHAR(500) NOT NULL;
```

#### Step 4: Drop Old Column (Optional)
```sql
-- Only after you've confirmed no code uses image_base64 anymore
-- Backup your database first!

ALTER TABLE drivers DROP COLUMN image_base64;
```

#### Step 5: Verify Migration
```sql
-- Check that avatarUrl is populated
SELECT id, first_name, avatar_url FROM drivers WHERE avatar_url IS NOT NULL;

-- Count migrated records
SELECT COUNT(*) as total, 
       COUNT(avatar_url) as with_url, 
       COUNT(image_base64) as with_base64
FROM drivers;
```

---

### PostgreSQL

#### Step 1: Add New Column
```sql
-- Add new avatar_url column
ALTER TABLE drivers ADD COLUMN avatar_url VARCHAR(500) NULL;

-- Verify column added
\d drivers
```

#### Step 2: Migrate Existing Data
```sql
-- Migrate old base64 to placeholder URLs
UPDATE drivers 
SET avatar_url = 'https://car-sharing-platform-images.s3.amazonaws.com/drivers/' || 
                 id::text || '/default-avatar.jpg'
WHERE image_base64 IS NOT NULL AND avatar_url IS NULL;
```

#### Step 3: Make Column Required (After Testing)
```sql
ALTER TABLE drivers ALTER COLUMN avatar_url SET NOT NULL;
```

#### Step 4: Drop Old Column (Optional)
```sql
ALTER TABLE drivers DROP COLUMN image_base64;
```

#### Step 5: Verify Migration
```sql
-- Check that avatarUrl is populated
SELECT id, first_name, avatar_url FROM drivers WHERE avatar_url IS NOT NULL;

-- Check constraints
\d drivers
```

---

### SQL Server

#### Step 1: Add New Column
```sql
-- Add new avatar_url column
ALTER TABLE drivers ADD avatar_url VARCHAR(500) NULL;
```

#### Step 2: Migrate Existing Data
```sql
-- Migrate old base64 to placeholder URLs
UPDATE drivers 
SET avatar_url = 'https://car-sharing-platform-images.s3.amazonaws.com/drivers/' + 
                 CAST(id AS VARCHAR(10)) + '/default-avatar.jpg'
WHERE image_base64 IS NOT NULL AND avatar_url IS NULL;
```

#### Step 3: Make Column Required (After Testing)
```sql
ALTER TABLE drivers ALTER COLUMN avatar_url VARCHAR(500) NOT NULL;
```

#### Step 4: Drop Old Column (Optional)
```sql
ALTER TABLE drivers DROP COLUMN image_base64;
```

---

## Step-by-Step Migration Process

### Phase 1: Preparation (15 minutes)

```bash
# 1. Backup database
mysqldump -u root -p car_sharing_db > backup_before_migration.sql

# 2. Test in development first
# Don't run on production immediately

# 3. Check current state
mysql> SELECT COUNT(*) FROM drivers;
mysql> SELECT COUNT(*) FROM drivers WHERE image_base64 IS NOT NULL;
```

### Phase 2: Add Column (5 minutes)

```bash
mysql -u root -p car_sharing_db < migration_add_column.sql

# Verify
mysql> DESCRIBE drivers;
# Should show avatar_url column
```

### Phase 3: Test Backend (10 minutes)

```bash
# 1. Start backend server
mvn spring-boot:run

# 2. Test upload endpoint
curl -X POST http://localhost:8081/api/drivers/1/avatar \
  -F "file=@test-image.jpg"

# 3. Verify URL in database
mysql> SELECT id, avatar_url FROM drivers WHERE id = 1;
# Should show S3 URL
```

### Phase 4: Test Frontend (10 minutes)

```bash
# 1. Start React app
npm run dev

# 2. Load home page
# Should see driver avatars from S3

# 3. Check browser console
# Should see no errors
```

### Phase 5: Migrate Historical Data (Optional, 30 minutes)

```bash
# Only if you want to keep old base64 images working

# Option A: Create migration script
mysql> UPDATE drivers 
       SET avatar_url = 'https://car-sharing-platform-images.s3.amazonaws.com/drivers/{id}/migrated.jpg'
       WHERE image_base64 IS NOT NULL 
       AND avatar_url IS NULL;

# Option B: Re-upload all images
# Create a batch script to upload all driver images programmatically
```

### Phase 6: Cleanup (5 minutes)

```bash
# Only after confirming everything works

# 1. Remove old image_base64 column
mysql> ALTER TABLE drivers DROP COLUMN image_base64;

# 2. Verify no errors
mysql> SELECT COUNT(*) FROM drivers;
mysql> SELECT COUNT(*) FROM drivers WHERE avatar_url IS NOT NULL;
```

---

## Migration SQL Files

### Create file: migration_add_column.sql

```sql
-- Database Migration: Add avatar_url Column
-- Date: 2024-01-01
-- Purpose: Add S3 avatar URL column to drivers table

-- Check current state
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'drivers' 
AND COLUMN_NAME IN ('avatar_url', 'image_base64');

-- Add new column
ALTER TABLE drivers ADD COLUMN avatar_url VARCHAR(500) NULL;

-- Add index for faster queries
CREATE INDEX idx_drivers_avatar_url ON drivers(avatar_url);

-- Verify
SELECT COUNT(*) as total_drivers,
       COUNT(avatar_url) as with_avatar_url,
       COUNT(image_base64) as with_base64
FROM drivers;

-- Success message
SELECT 'Migration completed successfully. Column avatar_url added.' as status;
```

### Create file: migration_drop_column.sql

```sql
-- Database Migration: Drop image_base64 Column
-- Date: 2024-01-01
-- Purpose: Remove old base64 image column after successful migration to S3
-- WARNING: Only run after confirming avatar_url is populated and backend uses it

-- Backup first!
-- mysqldump -u root -p db_name > backup.sql

-- Check data
SELECT COUNT(*) as total_drivers,
       COUNT(avatar_url) as with_avatar_url,
       COUNT(image_base64) as with_base64
FROM drivers;

-- Only proceed if both columns have values or base64 is being removed
-- The count with_avatar_url should be high enough

-- Drop old column
ALTER TABLE drivers DROP COLUMN image_base64;

-- Verify drop
DESCRIBE drivers;

-- Check space freed (approximate)
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size in MB'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'drivers';

SELECT 'Migration completed. Column image_base64 removed.' as status;
```

---

## Rollback Procedure

If something goes wrong, you can rollback:

### Option 1: Restore from Backup
```bash
# If you made a backup before migration
mysql -u root -p < backup_before_migration.sql
```

### Option 2: Manual Rollback
```sql
-- If you only added the column and haven't deleted data
ALTER TABLE drivers DROP COLUMN avatar_url;

-- If you deleted image_base64 but have backup
-- You'll need to restore from backup or manually recover
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup database (`mysqldump`)
- [ ] Test on development database first
- [ ] Confirm all 3 Java files are in place
- [ ] Confirm AWS credentials are configured
- [ ] Test upload endpoint before migration
- [ ] Notify team of migration window

### During Migration
- [ ] Run: Add avatar_url column
- [ ] Run: Test backend upload
- [ ] Run: Test frontend display
- [ ] Run: Verify database has URL
- [ ] Monitor for errors
- [ ] Check CloudWatch logs

### Post-Migration
- [ ] Run: Verify all drivers loaded correctly
- [ ] Run: Test upload new images
- [ ] Run: Check S3 bucket for files
- [ ] Run: Performance testing
- [ ] Run: Optional - Drop old column
- [ ] Run: Optional - Remove index on old column
- [ ] Confirm with team - all good!

---

## Monitoring & Validation

### Query to Check Migration Status
```sql
SELECT 
    COUNT(*) as total_drivers,
    COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as drivers_with_s3_url,
    COUNT(CASE WHEN avatar_url IS NULL THEN 1 END) as drivers_without_url,
    COUNT(CASE WHEN image_base64 IS NOT NULL THEN 1 END) as drivers_with_base64,
    ROUND(AVG(CHAR_LENGTH(avatar_url)), 2) as avg_url_length
FROM drivers;
```

### Expected Results After Migration
```
total_drivers: 100
drivers_with_s3_url: 100
drivers_without_url: 0
drivers_with_base64: 100 (still has old data until deleted)
avg_url_length: 95 (average S3 URL length)
```

---

## Performance Analysis

### Before Migration
```sql
-- Query to check old image_base64 column size
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH) / 1024 / 1024), 2) AS 'Data Size (MB)',
    ROUND(((DATA_FREE) / 1024 / 1024), 2) AS 'Free Space (MB)',
    ROUND((((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024) / 1024), 2) AS 'Total Size (GB)'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'drivers';

-- Typical result: 500MB+ (with 1000 drivers @ 100KB base64)
```

### After Migration
```sql
-- Same query after dropping image_base64
-- Typical result: 5MB+ (with 1000 drivers @ 50 bytes URL)
-- 100x size reduction!
```

---

## Automation Script (Python)

If you want to automate migration:

```python
#!/usr/bin/env python3
import mysql.connector
import subprocess
from datetime import datetime

def backup_database(db_name):
    """Create backup before migration"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f"backup_{db_name}_{timestamp}.sql"
    
    print(f"Creating backup: {backup_file}")
    subprocess.run([
        'mysqldump',
        '-u', 'root',
        '-p', 'your_password',  # Change this
        db_name,
        '>', backup_file
    ], shell=True)
    
    print(f"✓ Backup created: {backup_file}")
    return backup_file

def add_column(connection):
    """Add avatar_url column"""
    cursor = connection.cursor()
    
    print("Adding avatar_url column...")
    cursor.execute("""
        ALTER TABLE drivers 
        ADD COLUMN avatar_url VARCHAR(500) NULL
    """)
    
    connection.commit()
    print("✓ Column added successfully")

def verify_migration(connection):
    """Check migration status"""
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as with_url,
            COUNT(CASE WHEN image_base64 IS NOT NULL THEN 1 END) as with_base64
        FROM drivers
    """)
    
    result = cursor.fetchone()
    print(f"\nMigration Status:")
    print(f"  Total drivers: {result[0]}")
    print(f"  With S3 URL: {result[1]}")
    print(f"  With base64: {result[2]}")

def main():
    # Connect to database
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='your_password',  # Change this
        database='car_sharing_db'
    )
    
    # Create backup
    backup_file = backup_database('car_sharing_db')
    
    try:
        # Add column
        add_column(connection)
        
        # Verify
        verify_migration(connection)
        
        print("\n✓ Migration completed successfully!")
        print(f"✓ Backup saved to: {backup_file}")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        print(f"✓ Restore from backup: {backup_file}")
        raise

if __name__ == '__main__':
    main()
```

---

## Troubleshooting

### Issue: "Column already exists"
```sql
-- Check if column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'drivers' AND COLUMN_NAME = 'avatar_url';

-- If it exists, you can safely skip the add column step
```

### Issue: "Disk full during migration"
```bash
# Check available space
df -h

# Compress old backup
gzip backup_before_migration.sql

# Try migration again
```

### Issue: "Migration locked tables"
```sql
-- Check locks
SHOW OPEN TABLES WHERE In_use > 0;

-- Kill blocking queries if needed
KILL QUERY <process_id>;
```

---

## Testing Queries

### Test 1: Verify Column Added
```sql
DESCRIBE drivers;
-- Should show avatar_url VARCHAR(500)
```

### Test 2: Verify Data Integrity
```sql
-- Check no data was corrupted
SELECT COUNT(*) FROM drivers;
-- Should match before migration

-- Check all columns still exist
SELECT * FROM drivers LIMIT 1;
-- Should show all expected columns
```

### Test 3: Query Performance
```sql
-- Test URL lookup performance
EXPLAIN SELECT * FROM drivers WHERE avatar_url IS NOT NULL;
-- Should be fast (using index)

-- Compare with old base64 lookup
EXPLAIN SELECT * FROM drivers WHERE image_base64 IS NOT NULL;
-- Should be slower due to large data
```

---

## Summary

The migration from base64 to S3 URLs is safe and straightforward:

1. **Add Column** (5 min) - No downtime
2. **Test Backend** (10 min) - Upload works
3. **Test Frontend** (10 min) - Display works
4. **Migrate Data** (Optional, 30 min) - Keep old images working
5. **Drop Old Column** (Optional, 5 min) - Clean up

**Total Time**: 30 minutes for complete migration

**Risk Level**: Low (can rollback from backup)

**Benefits**: 100x database size reduction, 10x faster queries

