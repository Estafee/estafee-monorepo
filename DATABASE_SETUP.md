# Database Setup Guide - PostgreSQL on Ubuntu VPS

This guide shows you how to install and configure PostgreSQL for your Estafee application.

## Why PostgreSQL?

PostgreSQL is a powerful, open-source relational database that's:
- Free and widely supported
- Perfect for production applications
- Highly reliable and performant
- Easy to integrate with NestJS

---

## Step 1: Install PostgreSQL

### 1.1 Install PostgreSQL and required tools

```bash
# Update package list
sudo apt update

# Install PostgreSQL and contrib package
sudo apt install -y postgresql postgresql-contrib

# Check PostgreSQL service status
sudo systemctl status postgresql

# PostgreSQL should auto-start. If not:
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.2 Verify installation

```bash
# Check PostgreSQL version
psql --version
# Should show something like: psql (PostgreSQL) 14.x or 15.x
```

---

## Step 2: Configure PostgreSQL

### 2.1 Access PostgreSQL as postgres user

```bash
# Switch to postgres system user
sudo -i -u postgres

# Access PostgreSQL prompt
psql
```

You should see: `postgres=#`

### 2.2 Create database and user

```sql
-- Create a database for your application
CREATE DATABASE estafee_db;

-- Create a user with password
CREATE USER estafee_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE estafee_db TO estafee_user;

-- Grant schema permissions (PostgreSQL 15+)
\c estafee_db
GRANT ALL ON SCHEMA public TO estafee_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO estafee_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO estafee_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO estafee_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO estafee_user;

-- Exit psql
\q

-- Exit postgres user
exit
```

### 2.3 Configure PostgreSQL authentication (if needed)

By default, PostgreSQL allows local connections. If you need to adjust:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# (Replace 14 with your version if different)

# Find the line that looks like:
# local   all             all                                     peer
# Change 'peer' to 'md5' for password authentication

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Step 3: Test Database Connection

### 3.1 Test connection with psql

```bash
# Connect to the database
psql -U estafee_user -d estafee_db -h localhost

# Enter the password you created

# You should see: estafee_db=>

# List databases
\l

# List tables (should be empty for now)
\dt

# Exit
\q
```

### 3.2 Test with connection string

```bash
# Test the connection string format
psql "postgresql://estafee_user:your_secure_password_here@localhost:5432/estafee_db"
```

---

## Step 4: Update Backend Environment

### 4.1 Update backend .env.production

```bash
cd /var/www/estafee/estafee-monorepo

# Edit or create the backend environment file
nano apps/backend/.env.production
```

Add these lines (replace with your actual password):

```env
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://estafee_user:your_secure_password_here@localhost:5432/estafee_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=estafee_user
DATABASE_PASSWORD=your_secure_password_here
DATABASE_NAME=estafee_db

# Frontend URL for CORS
FRONTEND_URL=https://estafee.id

# JWT Secret (generate a random string)
JWT_SECRET=generate-a-long-random-secret-string-here
```

### 4.2 Generate a secure JWT secret

```bash
# Generate a random 64-character string
openssl rand -base64 48

# Copy the output and use it as your JWT_SECRET
```

---

## Step 5: Install Database Dependencies in Backend

### 5.1 Install PostgreSQL driver for NestJS

```bash
cd /var/www/estafee/estafee-monorepo

# Install TypeORM and PostgreSQL driver
pnpm add --filter backend @nestjs/typeorm typeorm pg

# Or if you prefer Prisma:
# pnpm add --filter backend @prisma/client
# pnpm add --filter backend -D prisma
```

### 5.2 Update backend to use database

You'll need to configure TypeORM or Prisma in your NestJS app. Here's a quick TypeORM example:

**`apps/backend/src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.production',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Step 6: Restart Backend

```bash
cd /var/www/estafee/estafee-monorepo

# Rebuild backend with new dependencies
pnpm install
pnpm build

# Restart backend with PM2
pm2 restart estafee-backend

# Check logs for any database connection errors
pm2 logs estafee-backend
```

---

## Security Best Practices

### 1. Use strong passwords

```bash
# Generate a strong password
openssl rand -base64 32
```

### 2. Regular backups

```bash
# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/db_backups"
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U estafee_user -d estafee_db -h localhost -F c -f $BACKUP_DIR/estafee_db_$DATE.dump

# Keep only last 7 backups
ls -t $BACKUP_DIR/estafee_db_*.dump | tail -n +8 | xargs -r rm

echo "Backup completed: estafee_db_$DATE.dump"
EOF

chmod +x ~/backup-db.sh

# Test backup
~/backup-db.sh

# Schedule daily backups with cron
crontab -e
# Add this line to run backup daily at 2 AM:
# 0 2 * * * /root/backup-db.sh >> /root/db_backup.log 2>&1
```

### 3. Restore from backup

```bash
# Restore database from backup
pg_restore -U estafee_user -d estafee_db -h localhost -c /path/to/backup.dump
```

### 4. Limit PostgreSQL to local connections only

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and set:
listen_addresses = 'localhost'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Monitoring Database

### Check database size

```sql
-- Connect to database
psql -U estafee_user -d estafee_db -h localhost

-- Check database size
SELECT pg_size_pretty(pg_database_size('estafee_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check active connections

```sql
SELECT * FROM pg_stat_activity WHERE datname = 'estafee_db';
```

### View slow queries (optional)

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add/uncomment these lines:
log_min_duration_statement = 1000  # Log queries taking > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d '

# Restart PostgreSQL
sudo systemctl restart postgresql

# View logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## Common PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to a database
\c estafee_db

-- List all tables
\dt

-- Describe a table
\d table_name

-- Show all users
\du

-- Quit psql
\q
```

---

## Troubleshooting

### Can't connect to database

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if PostgreSQL is listening
sudo netstat -tulpn | grep 5432

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Permission denied errors

```sql
-- Connect as postgres user
sudo -u postgres psql

-- Grant permissions again
\c estafee_db
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO estafee_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO estafee_user;
```

### Reset user password

```sql
-- Connect as postgres user
sudo -u postgres psql

-- Reset password
ALTER USER estafee_user WITH PASSWORD 'new_password_here';
```

---

## Alternative: Using Docker for PostgreSQL (Optional)

If you prefer using Docker:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run PostgreSQL in Docker
docker run -d \
  --name estafee-postgres \
  -e POSTGRES_USER=estafee_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=estafee_db \
  -p 5432:5432 \
  -v /var/lib/postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Check if running
docker ps

# Access database
docker exec -it estafee-postgres psql -U estafee_user -d estafee_db
```

---

## Next Steps

1. ✅ PostgreSQL installed and configured
2. ✅ Database and user created
3. ✅ Backend configured with database connection
4. 📝 Create database migrations (using TypeORM or Prisma)
5. 📝 Implement your data models/entities
6. 📝 Set up automated backups
7. 📝 Monitor database performance

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS TypeORM Documentation](https://docs.nestjs.com/techniques/database)
- [NestJS Prisma Documentation](https://docs.nestjs.com/recipes/prisma)
- [TypeORM Documentation](https://typeorm.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
