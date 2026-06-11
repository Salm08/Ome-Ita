# Configurazione Login con Google

## 1. Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un **nuovo progetto** (es. "Ome Ita") o selezionane uno esistente
3. Menu **API e servizi** → **Schermata di consenso OAuth**
   - Tipo utente: **Esterno** (per account Google qualsiasi)
   - Nome app: `Ome Ita`
   - Email assistenza: la tua email
   - Aggiungi dominio autorizzato se hai già un dominio (opzionale in dev)
   - Salva

4. **API e servizi** → **Credenziali** → **Crea credenziali** → **ID client OAuth**
   - Tipo applicazione: **Applicazione web**
   - Nome: `Ome Ita Web`

5. **URI di reindirizzamento autorizzati** — aggiungi **entrambi**:

   ```
   http://localhost:3000/api/auth/google/callback
   ```

   In produzione aggiungi anche:

   ```
   https://tuodominio.it/api/auth/google/callback
   ```

6. Copia **ID client** e **Segreto client**

## 2. File `.env`

Aggiungi al file `.env` nella root del progetto:

```env
GOOGLE_CLIENT_ID="123456789-xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxx"
```

Assicurati che sia impostato anche:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

In produzione:

```env
NEXT_PUBLIC_APP_URL="https://tuodominio.it"
```

## 3. Riavvia il server

```bash
npm run dev
```

Il pulsante **"Continua con Google"** apparirà automaticamente su login e registrazione quando le credenziali sono configurate.

## 4. Test

1. Apri `http://localhost:3000/login`
2. Clicca **Continua con Google**
3. Scegli un account Google
4. Al primo accesso verrai portato al **profilo** per completare sesso, età e regione
5. Agli accessi successivi andrai direttamente alla home

## Risoluzione problemi

| Errore | Soluzione |
|--------|-----------|
| `redirect_uri_mismatch` | L'URI in Google Console deve essere **identico** a `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback` |
| Pulsante Google non visibile | Controlla che `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` siano nel `.env` e riavvia il server |
| `access_denied` | L'app OAuth è in modalità test: aggiungi la tua email come **utente di test** nella schermata di consenso |
| App in produzione | Pubblica l'app nella schermata di consenso OAuth (verifica Google se necessario) |

## Note

- Gli utenti Google hanno l'email già verificata
- Se un account esiste già con la stessa email (registrazione classica), Google viene **collegato** automaticamente
- Il login con password continua a funzionare per chi si è registrato con email
