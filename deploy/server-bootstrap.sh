#!/bin/bash
# Bootstrap Ubuntu 22.04 per Ome Ita
# Esegui come root sul droplet DigitalOcean: bash deploy/server-bootstrap.sh

set -e

echo "==> Aggiornamento sistema"
apt update && apt upgrade -y

echo "==> Dipendenze base"
apt install -y curl git ufw docker.io docker-compose-plugin

echo "==> Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "==> PM2"
npm install -g pm2

echo "==> Caddy"
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

echo "==> coturn (TURN server)"
apt install -y coturn
sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn

echo "==> Firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3478/udp
ufw allow 3478/tcp
ufw allow 49152:65535/udp
ufw --force enable

echo "==> Cartella app"
mkdir -p /var/www/ome-ita/logs
chown -R "$SUDO_USER:$SUDO_USER" /var/www/ome-ita 2>/dev/null || true

echo ""
echo "✓ Bootstrap completato."
echo "  Prossimi passi: vedi STUDENT_DEPLOY.md sezione 4"
