#!/bin/bash

# Quick server check script for deployment issues
# Run this on your server to diagnose deployment problems

echo "🔍 Checking server deployment readiness..."
echo ""

# Check directory exists
echo "1. Checking /opt/alibi-studio directory..."
if [ -d "/opt/alibi-studio" ]; then
    echo "   ✅ Directory exists"
else
    echo "   ❌ Directory does NOT exist"
    echo "   Fix: sudo mkdir -p /opt/alibi-studio && sudo chown deployer:deployer /opt/alibi-studio"
    exit 1
fi

# Check permissions
echo ""
echo "2. Checking permissions..."
if [ -w "/opt/alibi-studio" ]; then
    echo "   ✅ Directory is writable"
    ls -ld /opt/alibi-studio
else
    echo "   ❌ Directory is NOT writable"
    echo "   Current permissions:"
    ls -ld /opt/alibi-studio
    echo "   Fix: sudo chown deployer:deployer /opt/alibi-studio"
    exit 1
fi

# Check disk space
echo ""
echo "3. Checking disk space..."
df -h /opt/alibi-studio
available=$(df -BG /opt/alibi-studio | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$available" -lt 1 ]; then
    echo "   ⚠️  Warning: Less than 1GB free space"
else
    echo "   ✅ Sufficient disk space available"
fi

# Check Docker
echo ""
echo "4. Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed: $(docker --version)"
    if docker ps &> /dev/null; then
        echo "   ✅ Docker daemon is running"
    else
        echo "   ❌ Docker daemon is NOT running"
        echo "   Fix: sudo systemctl start docker"
    fi
else
    echo "   ❌ Docker not installed"
fi

# Check docker-compose
echo ""
echo "5. Checking docker-compose..."
if command -v docker-compose &> /dev/null; then
    echo "   ✅ docker-compose installed: $(docker-compose --version)"
else
    echo "   ❌ docker-compose not installed"
fi

# Check SSH access
echo ""
echo "6. Checking SSH configuration..."
if [ -d ~/.ssh ]; then
    echo "   ✅ ~/.ssh directory exists"
    if [ -f ~/.ssh/authorized_keys ]; then
        key_count=$(wc -l < ~/.ssh/authorized_keys)
        echo "   ✅ authorized_keys exists ($key_count keys)"
    else
        echo "   ⚠️  authorized_keys does not exist"
    fi
else
    echo "   ⚠️  ~/.ssh directory does not exist"
fi

# Check port 3200 availability
echo ""
echo "7. Checking port 3200..."
if netstat -tuln 2>/dev/null | grep -q ":3200 "; then
    echo "   ⚠️  Port 3200 is already in use"
    netstat -tuln | grep ":3200 "
else
    echo "   ✅ Port 3200 is available"
fi

echo ""
echo "✅ Server check complete!"
echo ""
echo "If all checks passed but deployment still fails:"
echo "  1. Verify GitHub Secrets are set correctly"
echo "  2. Check GitHub Actions logs for detailed error messages"
echo "  3. Try SSH connection manually: ssh -p 2219 deployer@your-server"
