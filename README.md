# Ome Ita - Videochat Random Italia

Piattaforma di videochat e chat testuale random, focalizzata sul mercato italiano.

## Funzionalità

### Chat
- Video Chat e Solo Testo con match random
- Stop e Skip partner
- Preferenza match per regione
- Suono/vibrazione al nuovo match
- Onboarding prima utilizzo

### Account
- Registrazione/login email + password
- Login Google (configurabile via `.env`)
- Verifica email (link in console in dev)
- Pagina profilo: modifica dati, password, preferenze
- Export dati GDPR e cancellazione account

### Sicurezza e moderazione
- Pulsante Segnala in chat (utenti e ospiti)
- Rate limiting su login, registrazione, segnalazioni
- Ban utente e ban IP
- Log moderazione admin

### Admin
- Dashboard statistiche live
- Gestione segnalazioni utenti e ospiti
- Ban/sbanna, ban IP
- Filtro genere con face detection AI

### Legalità
- Privacy, Cookie Policy, Termini
- Banner consenso cookie GDPR

## Installazione locale

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
node scripts/download-models.js   # opzionale, per face detection admin
npm run dev
```

Sito su `http://localhost:3000`

**Admin:** `admin@omeita.local` / `ChangeThisAdminPassword123!`

**Login Google:** vedi [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)

## Deploy in produzione

**Hai GitHub Student Pack?** Segui **[STUDENT_DEPLOY.md](./STUDENT_DEPLOY.md)** (DigitalOcean + dominio .tech).

Riferimento tecnico: **[DEPLOY.md](./DEPLOY.md)**

```bash
node scripts/generate-secrets.js    # genera JWT, password admin, ecc.
cp .env.production.example .env     # template produzione (sul server)
```

## Struttura

```
src/app/          Pagine e API routes
src/components/   UI components
src/hooks/        Socket, WebRTC, face detection
src/lib/          Auth, matching, rate limit, IP ban
server.ts         Socket.io + Next.js custom server
prisma/           Database schema
DEPLOY.md         Guida produzione
```
