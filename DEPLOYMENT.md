# JNJD Registration — Oracle Cloud Always Free Deployment Guide

> **Target stack**: Spring Boot 3 · React/Nginx · PostgreSQL 16 · MinIO · Redis  
> **Host**: Oracle Cloud Infrastructure (OCI) Always Free ARM VM  
> **Estimated time**: 2–3 hours for a first-time setup

---

## Table of Contents

1. [Oracle Account Setup](#1-oracle-account-setup)
2. [Create the VM Instance](#2-create-the-vm-instance)
3. [Configure Networking & Firewall](#3-configure-networking--firewall)
4. [Connect via SSH](#4-connect-via-ssh)
5. [Server Provisioning](#5-server-provisioning)
6. [Install Docker & Docker Compose](#6-install-docker--docker-compose)
7. [Clone & Configure the Project](#7-clone--configure-the-project)
8. [Configure Environment Variables](#8-configure-environment-variables)
9. [MinIO Bucket & TLS Setup](#9-minio-bucket--tls-setup)
10. [Run the Stack](#10-run-the-stack)
11. [Domain & HTTPS (Nginx + Certbot)](#11-domain--https-nginx--certbot)
12. [Verify Everything is Running](#12-verify-everything-is-running)
13. [Automatic Startup on Reboot](#13-automatic-startup-on-reboot)
14. [Backups & Data Safety](#14-backups--data-safety)
15. [Monitoring & Logs](#15-monitoring--logs)
16. [Updating the App](#16-updating-the-app)
17. [Security Hardening Checklist](#17-security-hardening-checklist)
18. [Troubleshooting Reference](#18-troubleshooting-reference)

---

## 1. Oracle Account Setup

### 1.1 Create an Account

1. Go to **https://signup.cloud.oracle.com**
2. Choose **Free Tier** (not Pay As You Go initially)
3. Fill in your details — use a **real phone number**, Oracle will call/SMS to verify
4. **Credit card is required** for identity verification only — you will NOT be charged if you stay within Always Free limits
5. Choose your **Home Region** carefully:
   - This CANNOT be changed later
   - Pick the region geographically closest to your users
   - For Morocco: **`eu-frankfurt-1`** (Europe Frankfurt) or **`eu-marseille-1`** (South France) are best
   - The region name you pick here affects your VM's latency to Moroccan users
6. Wait for the activation email — can take 5–30 minutes

### 1.2 Always Free Limits (what you get forever, no charge)

| Resource               | Limit                           |
| ---------------------- | ------------------------------- |
| ARM VM (A1.Flex)       | Up to 4 OCPUs + 24 GB RAM total |
| Block Volume           | 200 GB total                    |
| Object Storage         | 20 GB                           |
| Outbound data transfer | 10 TB/month                     |
| Load Balancer          | 1 instance (10 Mbps)            |

> Your entire JNJD stack (Postgres + Redis + MinIO + Spring Boot + Nginx) fits comfortably within these limits.

---

## 2. Create the VM Instance

### 2.1 Navigate to Compute

1. Log into **https://cloud.oracle.com**
2. Top-left hamburger menu → **Compute** → **Instances**
3. Make sure your **compartment** is set to `(root)` in the left sidebar — this is where Always Free resources live
4. Click **Create instance**

### 2.2 Basic Info

- **Name**: `jnjd-prod` (or anything descriptive)
- **Compartment**: root (default)
- **Availability domain**: Leave as default (AD-1, AD-2, or AD-3 — any works)

### 2.3 Image and Shape — CRITICAL SETTINGS

Click **Edit** in the "Image and shape" section.

**Image:**

- Click **Change image**
- Select **Canonical Ubuntu**
- Version: **22.04 LTS** (stable, well-supported, recommended)
- Click **Select image**

**Shape:**

- Click **Change shape**
- Instance type: **Ampere** (ARM-based, this is the Always Free tier)
- Shape name: **VM.Standard.A1.Flex**
- **OCPUs**: Set to **4** (maximum for Always Free)
- **Memory (GB)**: Set to **24** (maximum for Always Free)
- Click **Select shape**

> ⚠️ If you set lower values you can increase them later, but ONLY up to the always-free ceiling. Set max now.

### 2.4 Networking

- **Primary network**: Create new virtual cloud network (VCN)
  - VCN name: `jnjd-vcn`
  - Subnet name: `jnjd-subnet-public`
- **Public IPv4 address**: ✅ **Assign a public IPv4 address** — make sure this is checked
- Leave everything else as default

### 2.5 Add SSH Key — CRITICAL

You need this to ever log into the server. **Do not skip this.**

**Option A — Generate a new key pair (recommended if you don't have one):**

On your local machine (Linux/macOS terminal, or Git Bash on Windows):

```bash
ssh-keygen -t ed25519 -C "jnjd-oracle" -f ~/.ssh/jnjd_oracle
```

This creates two files:

- `~/.ssh/jnjd_oracle` — **private key, never share this**
- `~/.ssh/jnjd_oracle.pub` — public key, upload this to Oracle

In the Oracle UI:

- Select **Upload public key files**
- Upload `~/.ssh/jnjd_oracle.pub`

**Option B — Paste existing key:**

- Select **Paste public keys**
- Paste the contents of your existing `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`

### 2.6 Boot Volume — Storage Settings

Click **Show advanced options** at the bottom, then the **Boot volume** tab:

- **Boot volume size (GB)**: Change from 47 to **100** (you get 200 GB free, use half for the OS disk)
- **Use in-transit encryption**: ✅ Yes
- **Encrypt using customer-managed key**: Leave unchecked (default Oracle-managed is fine)

### 2.7 Create

Click **Create** and wait 2–4 minutes. You'll see the instance go from **Provisioning** → **Running**.

Once running, note your **Public IP address** shown on the instance detail page — you'll need this for every subsequent step.

---

## 3. Configure Networking & Firewall

Oracle blocks all inbound traffic by default at two levels: the VCN Security List AND the OS firewall. You must open both.

### 3.1 Open Ports in OCI Security List

From the instance detail page:

1. Click the **Subnet** link (under Primary VNIC)
2. Click the subnet name (e.g., `jnjd-subnet-public`)
3. Click **Default Security List for jnjd-vcn**
4. Click **Add Ingress Rules** and add these rules one by one:

| Rule | Source CIDR | Protocol | Destination Port | Description             |
| ---- | ----------- | -------- | ---------------- | ----------------------- |
| 1    | 0.0.0.0/0   | TCP      | 22               | SSH (may already exist) |
| 2    | 0.0.0.0/0   | TCP      | 80               | HTTP                    |
| 3    | 0.0.0.0/0   | TCP      | 443              | HTTPS                   |

> For each rule: Source type = **CIDR**, IP Protocol = **TCP**, leave Source Port Range blank, set Destination Port Range.

**Do NOT open port 8080, 5432, 6379, or 9000/9001 to 0.0.0.0/0** — those are internal services that should only be accessible within the server itself.

### 3.2 Open Ports in Ubuntu's iptables

Oracle's Ubuntu image uses `iptables` directly (not `ufw`). SSH into your server first (see Section 4), then run:

```bash
# Open HTTP
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT

# Open HTTPS
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Save rules so they persist after reboot
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
sudo netfilter-persistent reload
```

When prompted during `iptables-persistent` install: **Yes** to save both IPv4 and IPv6 rules.

Verify the rules were applied:

```bash
sudo iptables -L INPUT --line-numbers
```

You should see entries for ports 80 and 443.

---

## 4. Connect via SSH

From your local machine:

```bash
ssh -i ~/.ssh/jnjd_oracle ubuntu@<YOUR_PUBLIC_IP>
```

Replace `<YOUR_PUBLIC_IP>` with the IP from the Oracle instance detail page.

**First connection**: Type `yes` when asked to add the host to known hosts.

### 4.1 Create an SSH Config Entry (optional but convenient)

On your local machine, edit `~/.ssh/config`:

```
Host jnjd-prod
    HostName <YOUR_PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/jnjd_oracle
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

After this you can connect with just:

```bash
ssh jnjd-prod
```

---

## 5. Server Provisioning

Run all these commands while logged into the server as `ubuntu`.

### 5.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

This may take 3–5 minutes. If prompted about restarting services, press Enter to accept defaults.

### 5.2 Set the Timezone

```bash
sudo timedatectl set-timezone Africa/Casablanca
timedatectl status
```

Verify the output shows `Africa/Casablanca`.

### 5.3 Set the Hostname

```bash
sudo hostnamectl set-hostname jnjd-prod
```

### 5.4 Install Essential Tools

```bash
sudo apt install -y \
  curl \
  wget \
  git \
  nano \
  htop \
  net-tools \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release \
  software-properties-common \
  iptables-persistent
```

---

## 6. Install Docker & Docker Compose

### 6.1 Add Docker's Official GPG Key and Repository

```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 6.2 Install Docker Engine

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 6.3 Post-Install Configuration

```bash
# Add ubuntu user to docker group (avoids needing sudo for every docker command)
sudo usermod -aG docker ubuntu

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Apply group change to current session WITHOUT logging out
newgrp docker
```

### 6.4 Verify Installation

```bash
docker --version
docker compose version
docker run hello-world
```

Expected output includes `Docker version 26.x.x` and `Hello from Docker!`.

---

## 7. Clone & Configure the Project

### 7.1 Clone the Repository

```bash
cd ~
git clone https://github.com/your-username/JNJD-Registration.git
cd JNJD-Registration
```

Replace the URL with your actual repository URL. If it's private, you'll need to set up a deploy key:

```bash
# Generate a deploy key
ssh-keygen -t ed25519 -C "jnjd-oracle-deploy" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub
```

Copy the output and add it to your GitHub repo under **Settings → Deploy keys → Add deploy key** (read-only is enough).

Then clone using SSH:

```bash
git clone git@github.com:your-username/JNJD-Registration.git
```

### 7.2 Create the .env File

```bash
cp .env.example .env
nano .env
```

See Section 8 for every value to set.

---

## 8. Configure Environment Variables

Edit `.env` with `nano .env`. Here is every variable explained:
84.8.221.120

```bash
# ── PostgreSQL ─────────────────────────────────────────────
POSTGRES_DB=jnjd
POSTGRES_USER=jnjd_user
# Generate: openssl rand -base64 24
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD

# ── Redis ──────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
# No password set by default in docker-compose; for production add:
# REDIS_PASSWORD=CHANGE_THIS_TOO

# ── MinIO ──────────────────────────────────────────────────
MINIO_ROOT_USER=minioadmin
# Generate: openssl rand -base64 24
MINIO_ROOT_PASSWORD=CHANGE_THIS_MINIO_PASSWORD
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=jnjd-proofs
# IMPORTANT: set this to your domain or public IP for presigned URLs to work
# If you have a domain: http://minio.yourdomain.com or https://minio.yourdomain.com
# If no domain yet: http://<YOUR_PUBLIC_IP>:9000
MINIO_PUBLIC_ENDPOINT=http://<YOUR_PUBLIC_IP>:9000

# ── Spring Backend ─────────────────────────────────────────
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/jnjd
SPRING_DATASOURCE_USERNAME=jnjd_user
SPRING_DATASOURCE_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD   # must match POSTGRES_PASSWORD above

# ── JWT ────────────────────────────────────────────────────
# Generate: openssl rand -hex 32
JWT_SECRET=GENERATE_64_CHAR_HEX_STRING_HERE
JWT_EXPIRATION_MS=86400000

# ── Admin credentials ──────────────────────────────────────
ADMIN_USERNAME=admin
# Use a strong password — this protects your entire dashboard
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD

# ── Email (SMTP) ───────────────────────────────────────────
# For production, use Gmail App Password or your real SMTP provider
# Gmail example:
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-char-app-password   # NOT your Google login password
MAIL_SMTP_AUTH=true
MAIL_STARTTLS_ENABLE=true
MAIL_STARTTLS_REQUIRED=true
MAIL_FROM=JNJD Registration <noreply@yourdomain.com>

# ── Frontend CORS ──────────────────────────────────────────
# Replace with your actual domain once set up
FRONTEND_ORIGIN=https://yourdomain.com,http://yourdomain.com
```

### 8.1 Generate Secure Secrets

Run these commands to generate strong values:

```bash
# For POSTGRES_PASSWORD
openssl rand -base64 24
# Example output: k9Xm2pL8vR3nQ7wY1jT5sA==

# For MINIO_ROOT_PASSWORD
openssl rand -base64 24

# For JWT_SECRET (must be at least 64 chars)
openssl rand -hex 32
# Example output: a3f8b2c1d4e5f6789012345678901234abcdef0123456789abcdef0123456789

# For ADMIN_PASSWORD
openssl rand -base64 18
```

### 8.2 Gmail App Password Setup (if using Gmail for SMTP)

1. Go to **https://myaccount.google.com/security**
2. Enable **2-Step Verification** (required)
3. Go to **https://myaccount.google.com/apppasswords**
4. Select app: **Mail**, device: **Other (Custom name)** → type "JNJD Server"
5. Copy the 16-character password (no spaces) → this is your `MAIL_PASSWORD`

---

## 9. MinIO Bucket & TLS Setup

### 9.1 Check the docker-compose.yml MinIO Section

Your `docker-compose.yml` already configures MinIO. The `minio-init` service creates the bucket automatically. Verify the `minio-init` service in your compose file includes:

```yaml
mc mb --ignore-existing local/$$MINIO_BUCKET &&
mc anonymous set none local/$$MINIO_BUCKET
```

The `none` policy keeps the bucket **private** — files are only accessible via presigned URLs, which is correct for enrollment proofs.

### 9.2 Open MinIO Port Temporarily for Initial Setup (optional)

If you need to access the MinIO console from your browser for debugging:

```bash
# In OCI Security List, temporarily add:
# Source: YOUR_HOME_IP/32 (not 0.0.0.0/0!)
# Port: 9001
# Remove this rule after initial verification
```

> Never expose port 9001 to `0.0.0.0/0` in production.

---

## 10. Run the Stack

### 10.1 First Run — Build and Start

This step downloads all Docker images and builds your app. It will take **10–20 minutes** on the first run.

```bash
cd ~/JNJD-Registration
docker compose --env-file .env up -d --build
```

Watch the build progress:

```bash
docker compose logs -f
```

Press `Ctrl+C` to stop watching logs (the containers keep running).

### 10.2 Verify All Containers Are Running

```bash
docker compose ps
```

Expected output — all should show `running` or `healthy`:

```
NAME              STATUS          PORTS
jnjd-postgres     healthy         0.0.0.0:5432->5432/tcp
jnjd-redis        healthy         0.0.0.0:6379->6379/tcp
jnjd-minio        healthy         0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
jnjd-minio-init   exited (0)      ← This should be exit code 0 (success)
jnjd-backend      healthy         0.0.0.0:8080->8080/tcp
jnjd-frontend     running         0.0.0.0:80->80/tcp
```

If `jnjd-minio-init` shows `exited (1)`, check its logs:

```bash
docker compose logs minio-init
```

### 10.3 Test the Stack Internally

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Expected: {"status":"UP",...}

# Test frontend
curl -I http://localhost:80

# Expected: HTTP/1.1 200 OK
```

### 10.4 Test from Your Browser

Open `http://<YOUR_PUBLIC_IP>` — you should see the JNJD landing page.

Open `http://<YOUR_PUBLIC_IP>/admin` — you should see the admin login page.

If the browser can't connect, go back to Section 3 and recheck the iptables rules.

---

## 11. Domain & HTTPS (Nginx + Certbot)

This section requires you to own a domain name. If you don't have one yet, skip to Section 12 and come back.

### 11.1 Point Your Domain to Oracle

In your domain registrar's DNS settings, add an **A record**:

- **Host**: `@` (root domain) or `jnjd` (subdomain)
- **Value**: `<YOUR_PUBLIC_IP>`
- **TTL**: 300 (5 minutes)

For MinIO public access (if you want a subdomain for file downloads):

- **Host**: `files` or `minio`
- **Value**: `<YOUR_PUBLIC_IP>`
- **TTL**: 300

Wait 5–15 minutes for DNS to propagate. Verify with:

```bash
dig yourdomain.com +short
# Should return your Oracle public IP
```

### 11.2 Install Host Nginx

The Nginx running inside Docker serves your app on port 80. Now you'll install a **second Nginx on the host OS** that:

1. Listens on ports 80 and 443
2. Handles SSL termination
3. Proxies requests to the Docker Nginx on port 80 (or directly to backend on 8080 for API)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 11.3 Adjust Docker to Not Bind Port 80 on the Host

Since host Nginx will now own port 80, you need to change how Docker exposes the frontend.

Edit `docker-compose.yml` on the server:

```bash
nano ~/JNJD-Registration/docker-compose.yml
```

Find the `frontend` service ports section and change:

```yaml
# BEFORE:
ports:
  - "80:80"

# AFTER (bind to localhost only):
ports:
  - "127.0.0.1:8081:80"
```

Do the same for backend if needed:

```yaml
# BEFORE:
ports:
  - "8080:8080"

# AFTER:
ports:
  - "127.0.0.1:8080:8080"
```

Restart Docker:

```bash
cd ~/JNJD-Registration
docker compose down
docker compose --env-file .env up -d
```

### 11.4 Configure Host Nginx

```bash
sudo nano /etc/nginx/sites-available/jnjd
```

Paste this configuration (replace `yourdomain.com` everywhere):

```nginx
# ── Main app (frontend + API proxy) ───────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Certbot will add SSL redirect here automatically
    # For now, proxy to Docker frontend

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;

        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Increase upload size for proof files (default is 1MB, too small)
    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/jnjd /etc/nginx/sites-enabled/
sudo nginx -t   # Test config — must say "syntax is ok"
sudo systemctl reload nginx
```

### 11.5 Install Certbot and Get SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Get the certificate (replace with your actual domain):

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

When prompted:

- Enter your **email address** (for renewal reminders)
- Type `Y` to agree to Terms of Service
- Type `N` for the marketing email
- Select **2** to redirect HTTP to HTTPS (recommended)

Certbot will automatically modify your Nginx config and reload it.

### 11.6 Verify Auto-Renewal

Certbot adds a systemd timer for auto-renewal. Verify it:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

Both should succeed without errors.

### 11.7 Update MINIO_PUBLIC_ENDPOINT

Now that you have HTTPS, update your `.env`:

```bash
nano ~/JNJD-Registration/.env
```

Change:

```bash
MINIO_PUBLIC_ENDPOINT=https://yourdomain.com   # or https://files.yourdomain.com if you made a subdomain
```

And update CORS:

```bash
FRONTEND_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Restart the stack:

```bash
cd ~/JNJD-Registration
docker compose --env-file .env up -d
```

---

## 12. Verify Everything is Running

Run through this checklist after every deployment:

```bash
# 1. All containers healthy
docker compose ps

# 2. Backend health endpoint
curl https://yourdomain.com/actuator/health
# Expected: {"status":"UP","components":{"db":{"status":"UP"},...}}

# 3. Database accessible
docker exec jnjd-postgres psql -U jnjd_user -d jnjd -c "\dt"
# Expected: list of tables (registration, member, registration_status_history)

# 4. Redis ping
docker exec jnjd-redis redis-cli ping
# Expected: PONG

# 5. MinIO bucket exists
docker exec jnjd-minio mc alias set local http://localhost:9000 minioadmin YOUR_MINIO_PASSWORD
docker exec jnjd-minio mc ls local/jnjd-proofs
# Expected: no error (bucket exists, may be empty)

# 6. Frontend loads
curl -I https://yourdomain.com
# Expected: HTTP/2 200

# 7. Admin login works
# Browser: https://yourdomain.com/admin → login with ADMIN_USERNAME/ADMIN_PASSWORD

# 8. Test a presigned URL (file upload flow)
curl "https://yourdomain.com/api/v1/registrations/presign?filename=test.pdf&contentType=application/pdf"
# Expected: JSON with uploadUrl and objectKey
```

---

## 13. Automatic Startup on Reboot

Oracle VMs reboot occasionally for maintenance. Make Docker Compose restart automatically.

### 13.1 Create a systemd Service

```bash
sudo nano /etc/systemd/system/jnjd.service
```

Paste:

```ini
[Unit]
Description=JNJD Registration Stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/JNJD-Registration
ExecStart=/usr/bin/docker compose --env-file .env up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300
User=ubuntu
Group=docker
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and test:

```bash
sudo systemctl daemon-reload
sudo systemctl enable jnjd.service
sudo systemctl start jnjd.service
sudo systemctl status jnjd.service
```

### 13.2 Test the Reboot Scenario

```bash
sudo reboot
```

Wait 3–4 minutes, then SSH back in and check:

```bash
docker compose -f ~/JNJD-Registration/docker-compose.yml ps
```

All containers should be running.

---

## 14. Backups & Data Safety

This is critical. Oracle's Always Free tier does not include automated database backups.

### 14.1 PostgreSQL Daily Backup Script

```bash
sudo mkdir -p /var/backups/jnjd
sudo chown ubuntu:ubuntu /var/backups/jnjd

nano ~/backup_db.sh
```

Paste:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/jnjd"
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="$BACKUP_DIR/jnjd_db_$DATE.sql.gz"
KEEP_DAYS=14   # Keep 2 weeks of backups

echo "[$(date)] Starting backup..."

# Dump and compress
docker exec jnjd-postgres pg_dump -U jnjd_user jnjd | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup saved to $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Cleaned up backups older than $KEEP_DAYS days"

# List current backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"
```

Make it executable:

```bash
chmod +x ~/backup_db.sh
```

Test it:

```bash
~/backup_db.sh
ls -lh /var/backups/jnjd/
```

### 14.2 Schedule with Cron

```bash
crontab -e
```

Add these lines:

```cron
# Daily DB backup at 2:00 AM server time
0 2 * * * /home/ubuntu/backup_db.sh >> /var/log/jnjd_backup.log 2>&1

# Weekly full backup verification at 3:00 AM Sunday
0 3 * * 0 docker exec jnjd-postgres psql -U jnjd_user -d jnjd -c "SELECT COUNT(*) FROM registration;" >> /var/log/jnjd_backup.log 2>&1
```

### 14.3 Download Backups Locally (recommended)

Set up a local cron or script to pull backups from the server:

On your local machine:

```bash
# Add to your local crontab or run manually
scp jnjd-prod:/var/backups/jnjd/jnjd_db_$(date +%Y-%m-%d)*.sql.gz ~/Downloads/
```

### 14.4 MinIO Data Backup

MinIO data is stored in a Docker volume. Back it up with:

```bash
# Save MinIO data to a tar.gz
docker run --rm \
  -v jnjd-registration_miniodata:/data \
  -v /var/backups/jnjd:/backup \
  alpine tar czf /backup/minio_$(date +%Y-%m-%d).tar.gz -C /data .
```

Add this to your cron script as well.

---

## 15. Monitoring & Logs

### 15.1 Real-Time Logs

```bash
# All services
docker compose -f ~/JNJD-Registration/docker-compose.yml logs -f

# Backend only
docker compose -f ~/JNJD-Registration/docker-compose.yml logs -f backend

# Last 100 lines of backend
docker compose -f ~/JNJD-Registration/docker-compose.yml logs --tail=100 backend
```

### 15.2 System Resource Monitor

```bash
# CPU, RAM, all processes
htop

# Docker container resource usage (live)
docker stats

# Disk usage
df -h
du -sh /var/lib/docker/volumes/
```

### 15.3 Check Nginx Access Logs

```bash
# Access log (all requests)
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### 15.4 Set Up Log Rotation for Docker

By default Docker logs grow unbounded. Limit them:

```bash
sudo nano /etc/docker/daemon.json
```

Paste:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  }
}
```

Restart Docker daemon:

```bash
sudo systemctl restart docker
cd ~/JNJD-Registration && docker compose --env-file .env up -d
```

### 15.5 Simple Uptime Monitoring (free)

Register at **https://uptimerobot.com** (free tier: 50 monitors, 5-minute checks):

1. Create a new monitor
2. Monitor type: **HTTP(s)**
3. URL: `https://yourdomain.com/actuator/health`
4. Friendly name: `JNJD Backend`
5. Alert contacts: your email
6. Repeat for `https://yourdomain.com` (frontend)

---

## 16. Updating the App

### 16.1 Standard Update Flow

```bash
cd ~/JNJD-Registration

# Pull latest code
git pull origin main

# Rebuild and restart (Docker only rebuilds changed layers)
docker compose --env-file .env up -d --build

# Verify after update
docker compose ps
curl http://localhost:8080/actuator/health
```

### 16.2 Zero-Downtime Consideration

Your current single-server setup will have ~30–60 seconds of downtime during `--build` while the backend image rebuilds. For a competition app this is acceptable. If you need zero-downtime in the future, look into `docker compose up -d --no-deps --build backend`.

### 16.3 Rolling Back

If an update breaks something:

```bash
# See recent git commits
git log --oneline -10

# Roll back to previous commit
git checkout <commit-hash>

# Rebuild with old code
docker compose --env-file .env up -d --build
```

---

## 17. Security Hardening Checklist

Run through this before going live.

### 17.1 SSH Hardening

```bash
sudo nano /etc/ssh/sshd_config
```

Ensure these settings:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

> ⚠️ Before restarting, open a second SSH session to verify you can still connect with your key.

### 17.2 Install Fail2ban (blocks brute-force SSH attempts)

```bash
sudo apt install -y fail2ban

sudo nano /etc/fail2ban/jail.local
```

Paste:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

### 17.3 Verify No Sensitive Ports are Externally Exposed

```bash
# This should NOT show ports 5432, 6379, 9000, 9001 listening on 0.0.0.0
sudo ss -tlnp | grep -E "5432|6379|9000|9001"

# Correct output example (bound to 127.0.0.1 only is OK):
# LISTEN  0  128  127.0.0.1:5432  ...
```

If any are on `0.0.0.0`, update your `docker-compose.yml` to bind to `127.0.0.1`:

```yaml
ports:
  - "127.0.0.1:5432:5432" # Postgres
  - "127.0.0.1:6379:6379" # Redis
```

### 17.4 Ensure .env is Never Committed

```bash
# Verify .env is in .gitignore (it should already be)
cat ~/JNJD-Registration/.gitignore | grep .env

# Double-check it's not tracked
git -C ~/JNJD-Registration status
```

### 17.5 HTTP Security Headers

Your Nginx config inside Docker (`frontend/nginx.conf`) already has:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
```

Add CSP to your host Nginx config:

```bash
sudo nano /etc/nginx/sites-available/jnjd
```

Add inside the `server` block after `ssl_certificate` lines:

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 18. Troubleshooting Reference

### Container Won't Start

```bash
# Check exit code and last logs
docker compose ps -a
docker compose logs <service-name>

# Most common fix for backend failing:
# 1. Database not ready yet (wait 30s and try again)
# 2. Wrong SPRING_DATASOURCE_PASSWORD (must match POSTGRES_PASSWORD)
# 3. Liquibase migration failure (check logs for SQL errors)
```

### "Permission denied" on Docker Commands

```bash
# You need to log out and back in after adding to docker group, OR:
newgrp docker
```

### Backend Health Shows DB Down

```bash
# Connect directly to postgres and check
docker exec -it jnjd-postgres psql -U jnjd_user -d jnjd
\dt   # should list tables
\q    # quit
```

### MinIO Presigned URLs Return 403

```bash
# Check MINIO_PUBLIC_ENDPOINT in .env
# It must be the URL that the BROWSER can reach, not the internal Docker URL
# Wrong:  MINIO_PUBLIC_ENDPOINT=http://minio:9000    ← internal hostname
# Right:  MINIO_PUBLIC_ENDPOINT=https://yourdomain.com
```

### SSL Certificate Errors

```bash
# Check cert validity
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx config is valid
sudo nginx -t
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up unused Docker images
docker system prune -f

# Clean up old images (keep last 2 builds)
docker image prune -a --filter "until=48h"
```

### Server is Slow / High Load

```bash
# Check what's using CPU
htop
# Press F6 to sort by CPU

# Check Docker container stats
docker stats --no-stream

# Spring Boot memory usage (should be ~75% of container memory per JVM settings)
docker exec jnjd-backend ps -aux
```

---

## Quick Reference Commands

```bash
# Start everything
cd ~/JNJD-Registration && docker compose --env-file .env up -d

# Stop everything
cd ~/JNJD-Registration && docker compose down

# Restart a single service
docker compose restart backend

# View backend logs live
docker compose logs -f backend

# Database backup
~/backup_db.sh

# Full system status
docker compose ps && df -h && free -h

# Nginx status
sudo systemctl status nginx

# SSL cert status
sudo certbot certificates
```

---

_Last updated: April 2026 — Tested on Oracle Cloud Ubuntu 22.04 LTS ARM (VM.Standard.A1.Flex)_
