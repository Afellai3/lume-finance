# 📱 Lume Finance - Mobile Debug Context

> Documento di contesto per debugging app mobile Android. Ultimo aggiornamento: **26 Feb 2026, 16:50 CET**

---

## 🎯 Stato Attuale

### ✅ Cosa Funziona
- Backend FastAPI avviato su `http://10.0.0.233:8000`
- Build APK completato con successo
- App installata su telefono Android
- **Safe area top OK**: Header NON coperto dal notch ✅
- Layout generale responsive

### ❌ Problemi Attivi

#### 1. Errore "Failed to fetch" in Dashboard
- **Sintomo**: Alert "Errore di connessione: Failed to fetch"
- **Quando**: All'apertura dell'app, caricamento Dashboard
- **Backend**: Riceve richieste da `10.0.0.233:59053` (funziona!)
- **App**: Non riesce a connettersi

#### 2. Bottom nav copre gesture bar Android
- **Safe area top**: ✅ Funziona (usa CSS `env(safe-area-inset-top)`)
- **Safe area bottom**: ❌ Non funziona (bottom nav si sovrappone)
- **Fix tentato**: CSS `env(safe-area-inset-bottom)` in Layout.tsx
- **Risultato**: Ancora problematico

---

## 🏗️ Architettura Mobile

### Stack Tecnologico
```
React 18.3 + TypeScript 5.5
    ↓
Vite Build (dist/)
    ↓
Capacitor 6.0 (wrapper nativo)
    ↓
Android WebView
    ↓
HTTP Request → Backend FastAPI
```

### File Chiave

#### 1. `frontend/.env`
```bash
VITE_API_URL=http://10.0.0.233:8000
```
**Status**: ⚠️ Da verificare se esiste e ha valore corretto

#### 2. `frontend/src/config/api.ts`
```typescript
import { Capacitor } from '@capacitor/core';

const getApiUrl = (): string => {
  if (Capacitor.isNativePlatform()) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('VITE_API_URL not configured');
      alert('⚠️ Errore connessione backend');
      return 'http://localhost:8000';
    }
    console.log('🔗 Capacitor API URL:', apiUrl);
    return apiUrl;
  }
  console.log('🌐 Web mode: relative paths');
  return '';
};

const API_BASE_URL = getApiUrl();

export const api = {
  async get(endpoint: string) {
    console.log(`📡 API GET: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log(`✅ API GET success: ${endpoint}`);
    return data;
  },
  // ... post, put, delete con logging simile
};
```

#### 3. `frontend/src/pages/Dashboard.tsx`
```typescript
import { api } from '../config/api';

const fetchDashboard = async () => {
  const data = await api.get('/api/analytics/dashboard?');
  // ...
};
```
**Status**: ✅ Convertito a usare `api.ts`

#### 4. `frontend/src/pages/Conti.tsx`
```typescript
import { api } from '../config/api';

const fetchConti = async () => {
  const data = await api.get('/api/conti');
  // ...
};
```
**Status**: ✅ Convertito a usare `api.ts`

#### 5. `frontend/src/components/layout/Layout.tsx`
```typescript
const mainStyles: React.CSSProperties = {
  paddingTop: 'max(env(safe-area-inset-top), 0px)',
  paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
};
```
**Status**: ✅ Safe area top OK, ❌ bottom problematico

#### 6. `frontend/capacitor.config.ts`
```typescript
const config: CapacitorConfig = {
  appId: 'com.lume.finance',
  appName: 'Lume Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true  // Necessario per HTTP
  }
};
```

#### 7. `frontend/android/app/src/main/AndroidManifest.xml`
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true">
```
**Status**: ⚠️ Da verificare (file xml potrebbe mancare)

---

## 🔍 Prossimi Passi Debug

### Step 1: Debug USB + Chrome DevTools

```bash
# 1. Sul telefono:
# Impostazioni → Info → Tocca 7 volte "Numero build"
# Impostazioni → Opzioni sviluppatore → Debug USB → ON

# 2. Collega USB al PC

# 3. Chrome: chrome://inspect/#devices
# Click "inspect" su Lume Finance
```

**Obiettivo**: Vedere console log:
- ✅ `🔗 Capacitor API URL: http://10.0.0.233:8000`
- ✅ `📡 API GET: http://10.0.0.233:8000/api/analytics/dashboard`
- ❌ Errore esatto (404? CORS? timeout?)

### Step 2: Verifica `.env`

```bash
cd C:\Users\utente\Desktop\lume-finance\frontend
type .env

# Se vuoto o mancante:
echo VITE_API_URL=http://10.0.0.233:8000 > .env

# Rebuilda
npm run build
npx capacitor sync
npx capacitor open android
# Android Studio → Build → Rebuild Project → Build APK
```

### Step 3: Verifica Network Security Config

```bash
# Verifica file XML esista
dir frontend\android\app\src\main\res\xml\network_security_config.xml

# Se mancante, crea:
# Android Studio → app/src/main/res → New → Directory → xml
# New → File → network_security_config.xml
```

Contenuto:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### Step 4: Test Backend da Telefono

```bash
# Sul telefono, apri browser e vai a:
http://10.0.0.233:8000/api/analytics/dashboard

# Dovresti vedere JSON tipo:
{
  "kpi": {
    "patrimonio_totale": 5000,
    "entrate_mese": 2000,
    "uscite_mese": 1500,
    "saldo_mese": 500
  },
  ...
}
```

**Se non funziona**: Firewall Windows blocca connessione.

```powershell
# Windows Firewall: consenti porta 8000
New-NetFirewallRule -DisplayName "Lume Finance Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

---

## 📋 Checklist Completa

### Backend
- [x] Backend avviato su `0.0.0.0:8000`
- [x] Endpoint `/api/analytics/dashboard` risponde
- [x] Log backend mostra richieste da `10.0.0.233`
- [ ] Firewall Windows consente porta 8000

### Frontend - Build
- [x] `npm run build` OK
- [ ] File `.env` esiste con `VITE_API_URL=http://10.0.0.233:8000`
- [x] `npx capacitor sync` OK
- [x] Android Studio: Clean + Rebuild + Build APK OK

### Frontend - Codice
- [x] `api.ts` centralizzato creato
- [x] Dashboard.tsx usa `api.ts`
- [x] Conti.tsx usa `api.ts`
- [ ] Movimenti.tsx usa `api.ts` (verificare)
- [ ] Altri componenti form convertiti

### Android
- [x] APK installato su telefono
- [ ] `network_security_config.xml` esiste
- [ ] `AndroidManifest.xml` ha `cleartext="true"`
- [ ] Debug USB abilitato
- [ ] Chrome DevTools connesso

### Safe Areas
- [x] Top: Header non coperto da notch ✅
- [ ] Bottom: Nav non copre gesture bar ❌

---

## 🔧 Fix Suggeriti

### Fix 1: `.env` Mancante

```bash
cd frontend
echo VITE_API_URL=http://10.0.0.233:8000 > .env
npm run build
npx cap sync
```

### Fix 2: Network Security Config

Se manca il file XML, l'app non può fare richieste HTTP (solo HTTPS).

### Fix 3: Bottom Nav Safe Area

Prova stile diretto su BottomNav invece che su Layout:

```typescript
// BottomNav.tsx
const navStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
};
```

Oppure usa `padding` invece di `calc()`:

```css
padding-bottom: max(env(safe-area-inset-bottom), 20px);
```

---

## 📞 Info Debug

### Network
- **PC IP**: `10.0.0.233`
- **Backend Port**: `8000`
- **Backend URL**: `http://10.0.0.233:8000`
- **Test URL**: `http://10.0.0.233:8000/api/analytics/dashboard`

### File Paths
```
C:\Users\utente\Desktop\lume-finance\
├── backend/
├── frontend/
│   ├── .env                           # ⚠️ VERIFICA
│   ├── src/config/api.ts              # ✅ OK
│   ├── android/
│   │   └── app/src/main/
│   │       ├── AndroidManifest.xml    # ⚠️ VERIFICA
│   │       └── res/xml/
│   │           └── network_security_config.xml  # ⚠️ VERIFICA
```

### Build Commands
```bash
# Full rebuild from scratch
cd C:\Users\utente\Desktop\lume-finance\frontend
rmdir /s /q android
rmdir /s /q dist
npm run build
npx cap add android
npx cap sync
npx cap open android
```

---

## 💡 Troubleshooting

### "Failed to fetch"
1. Verifica `.env` con IP corretto
2. Rebuilda con `npm run build && npx cap sync`
3. Rebuilda APK in Android Studio
4. Testa backend da browser telefono
5. Controlla firewall Windows

### Console vuota in Chrome DevTools
1. Debug USB abilitato?
2. Telefono autorizzato su PC?
3. App aperta in foreground?
4. URL: `chrome://inspect/#devices`

### Bottom nav copre gesti
1. Verifica CSS `env(safe-area-inset-bottom)` in BottomNav
2. Prova `max()` invece di `calc()`
3. Aggiungi `padding-bottom` fisso come fallback

---

## 📚 Riferimenti

- [Capacitor Docs - iOS/Android](https://capacitorjs.com/docs/android)
- [Chrome DevTools Remote Debug](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [CSS Safe Area](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Android Network Security](https://developer.android.com/training/articles/security-config)

---

**Prossimo aggiornamento**: Dopo debug USB con Chrome DevTools per vedere log console reali.
