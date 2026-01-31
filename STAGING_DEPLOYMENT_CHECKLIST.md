# Staging Deployment Checklist

Use this checklist to deploy the staging Studio for the first time.

## Prerequisites

- [ ] Staging dataset created in Sanity
- [ ] Server access configured (SSH key)
- [ ] Docker installed on server
- [ ] Nginx installed on server
- [ ] DNS record for `admin.alibistudios.co` pointing to server

## Step 1: Create Staging Dataset

### Option A: Via Sanity.io Web Interface (Recommended)

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Settings** → **API** → **Datasets**
4. Click **Add dataset**
5. Enter name: `staging`
6. Click **Create**

### Option B: Via CLI

```bash
sanity dataset create staging
```

Verify it was created:
```bash
sanity dataset list
```

### Step 1.1: Migrate Data from Production (Optional)

If you want to copy production data to staging:

```bash
# Export production dataset
sanity dataset export production production-backup.tar.gz

# Import to staging
sanity dataset import production-backup.tar.gz staging
```

**Note:** See `DATASET_MIGRATION.md` for detailed migration options including selective copying.

## Step 2: Install Dependencies

```bash
npm install
```

This installs `cross-env` needed for environment variables.

## Step 3: Test Locally

```bash
# Test staging Studio locally
npm run dev:staging
```

Verify:
- Studio opens at `http://localhost:3333`
- Title shows "Alibi (Staging)"
- Connects to `staging` dataset

## Step 4: Configure GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

Add these secrets:
- [ ] `STAGING_SERVER_HOST` - Your server IP (e.g., `46.62.255.49`)
- [ ] `STAGING_SERVER_USER` - SSH user (e.g., `deployer`)
- [ ] `STAGING_SERVER_PORT` - SSH port (e.g., `2219`, optional if using default)
- [ ] `STAGING_SERVER_SSH_KEY` - Private SSH key content (see instructions below)

#### How to Get the SSH Key

**Generate a new SSH key pair:**

1. Generate the key:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/staging_deploy
   ```
   (Press Enter when asked for passphrase, or set one if preferred)

2. Add public key to server:
   ```bash
   ssh-copy-id -i ~/.ssh/staging_deploy.pub -p 2219 deployer@your-server
   ```

3. Get private key content:
   ```bash
   cat ~/.ssh/staging_deploy
   ```
   Copy the entire output (including `-----BEGIN` and `-----END` lines)

4. Paste into GitHub secret `STAGING_SERVER_SSH_KEY`

**Or use existing SSH key (Recommended if you already have one):**

If you already have an SSH key that works with your server (e.g., for your frontend app):
```bash
cat ~/.ssh/id_rsa  # or ~/.ssh/id_ed25519
# or wherever your existing key is located
```
Copy the entire output and paste into GitHub secret.

**Note:** You can reuse the same SSH key for multiple deployments (frontend, Sanity, etc.) as long as it has access to the server. No need to create a separate key unless you want to manage them separately.

## Step 5: Prepare Server

SSH to your server:

```bash
ssh -p 2219 deployer@your-server
```

Create deployment directory:

```bash
sudo mkdir -p /opt/alibi-studio
sudo chown deployer:deployer /opt/alibi-studio
```

Verify Docker is running:

```bash
docker --version
docker-compose --version
```

## Step 6: Deploy via GitHub Actions

### Option A: Automatic (on push to main)

1. Push changes to main branch:
   ```bash
   git add .
   git commit -m "Add staging deployment setup"
   git push origin main
   ```

2. GitHub Actions will automatically trigger if staging-related files changed

### Option B: Manual Trigger

1. Go to GitHub → Actions tab
2. Select "Deploy Staging Studio to Server"
3. Click "Run workflow"
4. Type `deploy` in confirmation field
5. Click "Run workflow"

## Step 7: Verify Deployment

SSH to server and check:

```bash
# Check container is running
docker ps | grep alibi-studio-staging

# Check logs
docker logs alibi-studio-staging

# Test locally on server
curl http://localhost:3200
```

## Step 8: Setup Nginx

### 8.1 Copy Nginx Config

From your local machine:

```bash
scp nginx-admin-http.conf deployer@your-server:/tmp/admin-alibi-studio.conf
```

### 8.2 Install Nginx Config

On server:

```bash
sudo cp /tmp/admin-alibi-studio.conf /etc/nginx/sites-available/admin-alibi-studio
sudo ln -s /etc/nginx/sites-available/admin-alibi-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8.3 Test HTTP Access

Visit: `http://admin.alibistudios.co`

Should show Sanity Studio login page.

## Step 9: Setup SSL (Recommended)

On server:

```bash
sudo certbot --nginx -d admin.alibistudios.co
```

Certbot will:
- Get SSL certificate
- Update nginx config automatically
- Set up auto-renewal

### 9.1 Update to HTTPS Config (if needed)

If certbot didn't update the config, manually update:

```bash
# Copy HTTPS config
scp nginx-admin-https.conf deployer@your-server:/tmp/admin-alibi-studio.conf

# On server
sudo cp /tmp/admin-alibi-studio.conf /etc/nginx/sites-available/admin-alibi-studio
sudo nginx -t
sudo systemctl reload nginx
```

## Step 10: Verify Full Setup

- [ ] Container running: `docker ps | grep alibi-studio-staging`
- [ ] HTTP redirects to HTTPS: `http://admin.alibistudios.co` → `https://admin.alibistudios.co`
- [ ] HTTPS works: `https://admin.alibistudios.co`
- [ ] Can log in with Sanity credentials
- [ ] Connects to `staging` dataset
- [ ] Studio title shows "Alibi (Staging)"

## Step 10: Configure CORS (Required!)

After setting up nginx, you **must** configure CORS in Sanity to allow requests from your custom domain.

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Settings** → **API** → **CORS origins**
4. Click **Add CORS origin**
5. Enter: `https://admin.alibistudios.co`
6. Check **Allow credentials** (optional)
7. Click **Save**

**Without this step, you'll get CORS errors when accessing the Studio.**

See `CORS_SETUP.md` for detailed instructions.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs alibi-studio-staging

# Check if port is in use
netstat -tulpn | grep 3200

# Restart container
cd /opt/alibi-studio
docker-compose -f docker-compose.staging.yml restart
```

### Nginx issues

```bash
# Test config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/admin-alibi-studio-error.log

# Reload nginx
sudo systemctl reload nginx
```

### Can't access site

1. Check DNS: `dig admin.alibistudios.co`
2. Check firewall: `sudo ufw status`
3. Check container: `docker ps | grep staging`
4. Check nginx: `sudo systemctl status nginx`

## Maintenance

### Update Staging Studio

After schema changes, redeploy:

1. Push to main (triggers auto-deploy)
2. Or manually trigger GitHub Actions workflow

### View Logs

```bash
# Container logs
docker logs -f alibi-studio-staging

# Nginx access logs
sudo tail -f /var/log/nginx/admin-alibi-studio-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/admin-alibi-studio-error.log
```

### Restart Container

```bash
cd /opt/alibi-studio
docker-compose -f docker-compose.staging.yml restart
```

## Quick Reference

```bash
# Local development
npm run dev:staging

# Build staging
npm run build:staging

# Deploy via GitHub Actions
# Push to main or trigger manually

# Server commands
docker ps | grep staging
docker logs alibi-studio-staging
cd /opt/alibi-studio && docker-compose -f docker-compose.staging.yml restart
```

## Success Criteria

✅ Staging Studio accessible at `https://admin.alibistudios.co`
✅ Can log in with Sanity credentials
✅ Connects to `staging` dataset
✅ Production Studio still works at `sanity.io`
✅ Production dataset unchanged
