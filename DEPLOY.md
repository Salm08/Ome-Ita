# Guida al Deploy in Produzione

> **GitHub Student Pack?** Usa la guida dedicata: **[STUDENT_DEPLOY.md](./STUDENT_DEPLOY.md)**

Questa guida copre i dettagli tecnici per la produzione.

## 1. Server VPS consigliato

- **Hetzner**, **DigitalOcean** o **Railway** (minimo 2 GB RAM)
- Ubuntu 22.04+ o Debian 12
- Dominio puntato al server (es. `omeita.it`)

## 2. Database PostgreSQL

SQLite non è adatto alla produzione. Migra a PostgreSQL:

```bash
# In .env produzione:
DATABASE_URL="postgresql://user:password@host:5432/omeita?schema=public"
```

Aggiorna `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Poi:

```bash
npx prisma db push
npm run db:seed
```

## 3. Variabili d'ambiente produzione

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<stringa-casuale-64-caratteri>
ADMIN_EMAIL=admin@tuodominio.it
ADMIN_PASSWORD=<password-sicura>
NEXT_PUBLIC_APP_URL=https://omeita.it
NEXT_PUBLIC_SOCKET_URL=https://omeita.it

# Google OAuth (opzionale)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email SMTP (verifica email)
SMTP_HOST=smtp.tuoprovider.it
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# TURN server WebRTC (necessario per NAT)
NEXT_PUBLIC_TURN_URL=turn:turn.tuodominio.it:3478
NEXT_PUBLIC_TURN_USERNAME=omeita
NEXT_PUBLIC_TURN_CREDENTIAL=<password-turn>
```

## 4. HTTPS con Caddy (consigliato)

```bash
sudo apt install caddy
```

`/etc/caddy/Caddyfile`:

```
omeita.it {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

## 5. TURN server (coturn)

Per utenti dietro firewall/NAT che non riescono a connettersi in video:

```bash
sudo apt install coturn
```

Configura `/etc/turnserver.conf` e apri porte UDP 3478 + range RTP.

Servizi gestiti alternativi: **Twilio STUN/TURN**, **Metered.ca**.

## 6. Process manager (PM2)

```bash
npm install -g pm2
npm run build
pm2 start "npm run start" --name ome-ita
pm2 save
pm2 startup
```

## 7. Modelli face-api (admin)

```bash
node scripts/download-models.js
```

## 8. Checklist pre-lancio

- [ ] JWT_SECRET e password admin cambiati
- [ ] HTTPS attivo
- [ ] PostgreSQL configurato
- [ ] TURN server configurato e testato
- [ ] Email privacy@ e contatti reali nelle policy
- [ ] Google OAuth redirect URI: `https://tuodominio.it/api/auth/google/callback`
- [ ] Backup database automatici
- [ ] Firewall: solo 80, 443, 22 aperti

## 9. Test post-deploy

1. Registrazione e login
2. Videochat tra due dispositivi (uno su WiFi, uno su 4G)
3. Segnalazione e pannello admin
4. Ban IP e verifica blocco
5. Cookie banner e policy accessibili
