# JNJD Registration - Deployment Guide

This guide outlines a comprehensive, **100% free** deployment strategy for the JNJD Registration web application stack (Spring Boot, React, PostgreSQL, MinIO, Redis).

Given the stateful requirements (Postgres, MinIO, Redis) and the Spring Boot application's memory footprint, traditional Platform-as-a-Service (PaaS) free tiers like Render or Fly.io are insufficient or do not offer persistent object storage. The best solution is **Oracle Cloud's Always Free Tier**, which provides a generous ARM virtual machine suitable for running the entire stack via Docker Compose.

---

## 1. Prerequisites

1.  **Oracle Cloud Account**: Sign up at [Oracle Cloud](https://www.oracle.com/cloud/free/). Note: Requires a valid credit card for verification, but you will not be charged if you stay within the Always Free limits.
2.  **Domain Name**: (Optional but recommended) A domain name from a registrar (e.g., Namecheap, Cloudflare) pointing to your VM's public IP.
3.  **Local Environment**: Git, SSH, and Docker.

---

## 2. Infrastructure Setup (Oracle Cloud)

### 2.1. Create a Compute Instance
1. Log into your Oracle Cloud Dashboard.
2. Go to **Compute** -> **Instances** -> **Create Instance**.
3. **Name**: `jnjd-registration-prod`.
4. **Image and Shape**:
   - Image: Canonical Ubuntu (latest LTS, e.g., 22.04 or 24.04).
   - Shape: **Ampere ARM (VM.Standard.A1.Flex)**. Configure it to use up to **4 OCPUs** and **24 GB RAM**. (This is within the Always Free tier).
5. **Networking**: Ensure you assign a Public IP address.
6. **Add SSH Keys**: Generate an SSH key locally (`ssh-keygen -t ed25519`) and paste the public key.
7. Click **Create**.

### 2.2. Configure Virtual Cloud Network (VCN)
Oracle Cloud's firewall blocks most ports by default. You need to open ports 80 (HTTP) and 443 (HTTPS).
1. Go to your instance details page -> click the **Subnet** link.
2. Click on the **Default Security List**.
3. Add **Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`, Protocol: TCP, Destination Port: `80`
   - Source CIDR: `0.0.0.0/0`, Protocol: TCP, Destination Port: `443`

---

## 3. Server Provisioning

Connect to your new server via SSH:
```bash
ssh ubuntu@<YOUR_PUBLIC_IP>
```

### 3.1. Open Ubuntu Firewall (iptables)
Even though the VCN is configured, Ubuntu's `iptables` also blocks ports on Oracle Cloud.
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 3.2. Install Docker & Docker Compose
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2 git

# Add ubuntu user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu
```
*Log out and log back in for the group change to take effect.*

---

## 4. Application Deployment

### 4.1. Clone Repository
```bash
git clone https://github.com/your-username/JNJD-Registration.git
cd JNJD-Registration
```

### 4.2. Environment Configuration
Copy the example environment file and fill in production secrets.
```bash
cp .env.example .env
nano .env
```
Ensure you generate strong, secure passwords for:
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `JWT_SECRET` (Use a base64 encoded secure string)
- `MAIL_PASSWORD` (Use your actual SMTP password or App Password)

### 4.3. Run Docker Compose
The `docker-compose.yml` file is already configured to build the Spring Boot and React applications and start the required services.

```bash
docker compose -f docker-compose.yml up -d --build
```
This will:
1. Spin up Postgres, Redis, and MinIO.
2. Build and start the Spring Boot Backend.
3. Build the React Frontend and serve it via Nginx.

---

## 5. Exposing to the Internet (Domain & SSL)

The default `docker-compose.yml` likely exposes Nginx on port 80. If you have a domain name, you should set up an Nginx reverse proxy with SSL (Certbot) on the host machine to securely route traffic.

### 5.1. Install Host Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 5.2. Configure Host Nginx
Create a new configuration:
```bash
sudo nano /etc/nginx/sites-available/jnjd
```
Add the following (assuming your docker compose Nginx is running on port 80):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80; # Ensure this port matches your frontend docker service port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/jnjd /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 5.3. Apply SSL with Certbot
```bash
sudo certbot --nginx -d yourdomain.com
```
Certbot will automatically configure SSL and handle auto-renewal.

---

## 6. Maintenance & Updates

### 6.1. Viewing Logs
To check the logs of your services:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### 6.2. Updating the Application
When you push new code to your repository:
```bash
cd JNJD-Registration
git pull origin main
docker compose up -d --build
```
Docker will only rebuild the layers that changed, minimizing downtime.

### 6.3. Database Backups
To create a backup of your PostgreSQL database:
```bash
docker exec -t jnjd-postgres pg_dumpall -c -U jnjd_admin > dump_$(date +%Y-%m-%d).sql
```
Download this `.sql` file locally to ensure you do not lose data.
