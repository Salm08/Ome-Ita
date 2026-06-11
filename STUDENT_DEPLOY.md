# Deploy con GitHub Student Developer Pack

Guida passo-passo per mettere **Ome Ita** online usando i benefit studenti.

## Cosa useremo (consigliato)

| Risorsa | Benefit Student Pack | Uso |
|---------|---------------------|-----|
| **DigitalOcean** | ~$200 crediti / 12 mesi | VPS (droplet) per app + Socket.io |
| **Namecheap / Name.com** | Dominio gratis o scontato | Es. `omeita.tech` gratis 1 anno |
| **GitHub** | Repo privato gratis | Codice sorgente |

> **Azure** è possibile ma più complesso per Socket.io/WebRTC. DigitalOcean droplet è la scelta più semplice.

**Costo stimato:** $0 per molti mesi (coperto dai crediti). Droplet consigliato: **2 GB RAM / 1 vCPU** (~$12/mese).

---

## Fase 1 — Dominio (15 min)

### Opzione A: dominio .tech gratis (Namecheap Student)

1. [education.github.com/pack](https://education.github.com/pack) → trova **Namecheap**
2. Registra un dominio `.tech` (es. `omeita.tech`)
3. Vai nel pannello DNS del dominio

### Opzione B: Name.com / altro credito student

Stesso procedimento: registra dominio e apri la gestione DNS.

### DNS (da fare dopo il droplet — Fase 2)

Aggiungi questi record (sostituisci `IP_DROPLET`):

| Tipo | Nome | Valore |
|------|------|--------|
| A | `@` | `IP_DROPLET` |
| A | `www` | `IP_DROPLET` |

Propagazione DNS: 5 min – 48 ore (di solito < 1 ora).

---

## Fase 2 — Droplet DigitalOcean (20 min)

1. [cloud.digitalocean.com](https://cloud.digitalocean.com) → accedi con GitHub Student Pack
2. **Create Droplet**
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic → Regular → **$12/mo** (2 GB RAM) oppure $6/mo (1 GB, stretto)
   - **Region:** Frankfurt o Amsterdam (bassa latenza per Italia)
   - **Authentication:** SSH key (consigliato) o password
   - Nome: `ome-ita`
3. Crea il droplet e copia l’**IP pubblico**
4. Torna al DNS del dominio e imposta i record A (Fase 1)

### Firewall DigitalOcean (consigliato)

Networking → Firewalls → Create:

- Inbound: TCP 22, 80, 443 — UDP 3478, UDP 49152-65535
- Outbound: all

Assegna il firewall al droplet.

---

## Fase 3 — Bootstrap server (10 min)

Dal tuo PC (PowerShell o terminale):

```bash
ssh root@IP_DROPLET
```

Sul server, clona il progetto:

```bash
cd /var/www
git clone https://github.com/TUO-USER/ome-ita.git ome-ita
cd ome-ita
bash deploy/server-bootstrap.sh
```

---

## Fase 4 — PostgreSQL (5 min)

Sul server:

```bash
cd /var/www/ome-ita
node scripts/generate-secrets.js   # copia i valori generati
cp .env.production.example .env
nano .env                          # incolla segreti e imposta il dominio
```

Avvia PostgreSQL:

```bash
export POSTGRES_PASSWORD="il-valore-da-.env"
docker compose -f deploy/docker-compose.yml up -d
```

Passa Prisma a PostgreSQL e crea le tabelle:

```bash
node scripts/set-db-provider.mjs postgresql
npm install
npx prisma db push
npm run db:seed
node scripts/download-models.js
```

---

## Fase 5 — Build e avvio app (10 min)

```bash
cd /var/www/ome-ita
npm run build
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # esegui il comando che PM2 ti stampa
```

Verifica: `curl http://localhost:3000` deve rispondere.

---

## Fase 6 — HTTPS con Caddy (5 min)

```bash
nano deploy/Caddyfile
# Sostituisci DOMINIO con omeita.tech (o il tuo dominio)

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Apri `https://tuodominio.tech` — dovresti vedere il sito con lucchetto verde.

---

## Fase 7 — TURN server (WebRTC, 15 min)

Senza TURN, molti utenti su 4G/NAT non vedranno il video.

```bash
# Sul server, modifica deploy/coturn.conf:
# - DOMINIO → tuodominio.tech
# - TURN_SECRET → stesso valore in .env (NEXT_PUBLIC_TURN_CREDENTIAL)
# - IP_PUBBLICO_DROPLET → IP del droplet

sudo cp deploy/coturn.conf /etc/turnserver.conf
sudo systemctl restart coturn
```

Nel `.env` sul server:

```env
NEXT_PUBLIC_TURN_URL=turn:tuodominio.tech:3478
NEXT_PUBLIC_TURN_USERNAME=omeita
NEXT_PUBLIC_TURN_CREDENTIAL=stesso-TURN_SECRET
```

Riavvia l’app: `pm2 restart ome-ita`

---

## Fase 8 — Google OAuth produzione

In [Google Cloud Console](https://console.cloud.google.com):

1. Credenziali OAuth → modifica il client web
2. Aggiungi URI di reindirizzamento:
   ```
   https://tuodominio.tech/api/auth/google/callback
   ```
3. Schermata di consenso → aggiungi dominio autorizzato: `tuodominio.tech`
4. Aggiorna `.env` sul server con `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
5. `pm2 restart ome-ita`

---

## Fase 9 — Checklist finale

- [ ] `.env` con JWT_SECRET e ADMIN_PASSWORD nuovi (mai quelli di dev)
- [ ] `NEXT_PUBLIC_APP_URL` e `SOCKET_URL` = `https://tuodominio.tech`
- [ ] Admin login funziona — cambia password subito
- [ ] Videochat testata da WiFi + 4G
- [ ] Privacy policy aggiornata con nome ed email reali
- [ ] Backup DB: `docker exec omeita-postgres pg_dump -U omeita omeita > backup.sql`

---

## Aggiornamenti futuri

```bash
ssh root@IP_DROPLET
cd /var/www/ome-ita
git pull
npm install
npm run build
pm2 restart ome-ita
```

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| Sito non carica | `pm2 logs ome-ita` — controlla errori |
| WebSocket non connette | Verifica Caddy proxy e che `NEXT_PUBLIC_SOCKET_URL` sia HTTPS |
| Video nero / solo audio | Configura TURN (Fase 7) |
| Google login errore | URI callback deve essere identico in Google Console |
| DB connection refused | `docker ps` — postgres deve essere running |

---

## Architettura finale

```
Utente → tuodominio.tech (HTTPS, Caddy)
              ↓
         PM2 → Node.js :3000 (Next.js + Socket.io)
              ↓
         PostgreSQL (Docker, porta 5432 locale)
         
WebRTC video → peer-to-peer + TURN (coturn :3478)
```
