# Troubleshooting SSH Authentication in GitHub Actions

## Error: `ssh: unable to authenticate, attempted methods [none publickey]`

This means GitHub Actions can't authenticate with your server using the SSH key.

## Step 1: Verify SSH Key Format

The SSH key in GitHub Secrets must be formatted correctly:

1. **Get your private key:**
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   ```

2. **Check the format:**
   - Must start with: `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`
   - Must end with: `-----END OPENSSH PRIVATE KEY-----` or `-----END RSA PRIVATE KEY-----`
   - Should have multiple lines in between
   - No extra spaces at the beginning/end of lines
   - No missing newlines

3. **Copy the ENTIRE key** (including BEGIN and END lines) and paste into GitHub Secret `STAGING_SERVER_SSH_KEY`

## Step 2: Verify Public Key is on Server

1. **Get your public key:**
   ```bash
   cat ~/.ssh/id_rsa.pub
   # or
   cat ~/.ssh/id_ed25519.pub
   ```

2. **SSH to your server and check:**
   ```bash
   ssh -p 2219 deployer@your-server
   cat ~/.ssh/authorized_keys | grep "your-public-key-fingerprint"
   ```

3. **If not present, add it:**
   ```bash
   # From your local machine
   ssh-copy-id -i ~/.ssh/id_rsa.pub -p 2219 deployer@your-server
   ```

## Step 3: Test SSH Connection Manually

Test if the key works from your local machine:

```bash
ssh -i ~/.ssh/id_rsa -p 2219 deployer@your-server
```

If this works, the key is correct. If not, fix the server setup first.

## Step 4: Verify GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

Verify these secrets are set:
- ✅ `STAGING_SERVER_HOST` - Your server IP (e.g., `46.62.255.49`)
- ✅ `STAGING_SERVER_USER` - SSH user (e.g., `deployer`)
- ✅ `STAGING_SERVER_PORT` - SSH port (e.g., `2219`, or leave empty for default 22)
- ✅ `STAGING_SERVER_SSH_KEY` - Private SSH key (entire key including BEGIN/END)

## Step 5: Check Server SSH Configuration

On your server, verify SSH allows key authentication:

```bash
# Check SSH config
sudo cat /etc/ssh/sshd_config | grep -E "PubkeyAuthentication|AuthorizedKeysFile"

# Should show:
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
```

## Step 6: Check Server Permissions

On your server, verify correct permissions:

```bash
# SSH to server
ssh -p 2219 deployer@your-server

# Check permissions
ls -la ~/.ssh/
# Should show:
# drwx------ .ssh
# -rw------- authorized_keys

# Fix if needed:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## Step 7: Test with Verbose SSH

To debug, you can test with verbose output:

```bash
ssh -v -i ~/.ssh/id_rsa -p 2219 deployer@your-server
```

Look for:
- `Offering public key` - Key is being offered
- `Server accepts key` - Server accepted the key
- `Authentication succeeded` - Success!

## Common Issues

### Issue: Key has wrong line endings
**Fix:** Make sure the key in GitHub Secrets uses Unix line endings (LF), not Windows (CRLF)

### Issue: Key is truncated
**Fix:** Copy the ENTIRE key, including all lines between BEGIN and END

### Issue: Extra spaces
**Fix:** Remove any leading/trailing spaces from the key

### Issue: Wrong key
**Fix:** Make sure you're using the private key (id_rsa), not the public key (id_rsa.pub)

### Issue: Key doesn't match server
**Fix:** Ensure the public key corresponding to your private key is in `~/.ssh/authorized_keys` on the server

## Quick Fix Checklist

- [ ] Private key copied correctly (entire key, including BEGIN/END)
- [ ] Public key added to server's `~/.ssh/authorized_keys`
- [ ] Server permissions correct (700 for .ssh, 600 for authorized_keys)
- [ ] GitHub Secrets all set correctly
- [ ] SSH connection works manually from your machine
- [ ] Server SSH config allows public key authentication

## Still Not Working?

1. Check GitHub Actions logs for more details
2. Try generating a new SSH key pair specifically for GitHub Actions
3. Verify the server IP, username, and port are correct
4. Check if your server firewall allows SSH connections from GitHub Actions IPs
