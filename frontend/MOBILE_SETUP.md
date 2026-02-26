# 📱 Lume Finance - Mobile App Setup

Guida completa per generare e testare l'APK Android dell'app Lume Finance.

## ✅ Fix Applicati (Branch fix/mobile-app)

### 1. Safe Area Support
- ✅ Aggiunto `viewport-fit=cover` in `index.html`
- ✅ CSS variables per safe-area-inset (notch/navigation bar)
- ✅ Padding automatico su body per evitare overlap

### 2. API Configuration
- ✅ File `src/config/api.ts` per gestione centralizzata API
- ✅ Auto-detect Capacitor vs Web
- ✅ Support per variabili d'ambiente `.env`

### 3. Capacitor Config
- ✅ `capacitor.config.ts` con impostazioni Android
- ✅ Cleartext abilitato per test con IP locale
- ✅ Mixed content consentito

### 4. Gitignore
- ✅ Escluse cartelle `android/`, `ios/`, `dist/` dal versioning

---

## 🚀 Setup Iniziale

### 1. Pull del Branch
```bash
git pull origin fix/mobile-app
git checkout fix/mobile-app
```

### 2. Installa Dipendenze (se non fatto)
```bash
cd frontend
npm install
```

### 3. Configura API Backend

Crea file `.env` in `frontend/`:

**Opzione A: Backend Deployato (Consigliato)**
```env
VITE_API_URL=https://tuo-backend.onrender.com
```

**Opzione B: IP Locale (Per Test)**
```bash
# Windows: trova il tuo IP
ipconfig
# Cerca "IPv4 Address" (es. 192.168.1.10)
```

Poi in `.env`:
```env
VITE_API_URL=http://192.168.1.10:8000
```

E avvia FastAPI su tutte le interfacce:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Build Frontend
```bash
npm run build
```

### 5. Sync Capacitor
```bash
npx cap sync
```

---

## 📦 Generare APK

### Metodo 1: Android Studio (Consigliato)

1. Apri progetto:
```bash
npx cap open android
```

2. Aspetta Gradle Sync (3-10 min la prima volta)

3. Genera APK:
   - Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Aspetta compilazione (2-5 min)
   - APK in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Metodo 2: Linea di Comando

```bash
cd android
.\gradlew assembleDebug  # Windows
./gradlew assembleDebug  # Linux/Mac
```

---

## 📲 Installare su Dispositivo

### Opzione A: USB
1. Abilita **Debug USB** sul telefono (Opzioni Sviluppatore)
2. Collega via USB
3. In Android Studio: clicca **Run** ▶️
4. Seleziona il tuo dispositivo

### Opzione B: Trasferimento Manuale
1. Copia `app-debug.apk` sul telefono
2. Abilita "Installa app sconosciute" nelle Impostazioni
3. Apri APK e installa

---

## 🧪 Testing con Emulatore

### Creare Emulatore Android

1. In Android Studio: **Tools → Device Manager**
2. Clicca **Create Device**
3. Scegli dispositivo (es. Pixel 6)
4. Scarica immagine sistema (es. Android 13 - API 33)
5. Finisci setup

### Avviare App nell'Emulatore

```bash
npx cap run android
```

Oppure click su **Run** ▶️ in Android Studio.

---

## 🔄 Workflow di Sviluppo

### Sviluppo UI (Quotidiano)

```bash
# Browser - hot reload istantaneo
npm run dev
# Apri http://localhost:3000
```

### Test Mobile (Periodico)

```bash
# Quando vuoi testare su Android
npm run build
npx cap sync
npx cap run android  # o Run in Android Studio
```

### Live Reload su Android (Avanzato)

Per vedere modifiche in tempo reale sull'app:

1. Trova il tuo IP locale (ipconfig)
2. Modifica `capacitor.config.ts`:
```typescript
server: {
  url: 'http://192.168.1.10:3000',  // Tuo IP + porta Vite
  cleartext: true
}
```
3. Sync e run:
```bash
npm run dev  # In un terminale
npx cap sync
npx cap run android  # In altro terminale
```

Ogni modifica si riflette automaticamente sull'app! 🔥

---

## 🐛 Troubleshooting

### Errore: "Unexpected token '<'... is not valid JSON"
**Causa**: App non raggiunge backend FastAPI

**Soluzione**:
1. Verifica che FastAPI sia avviato
2. Controlla URL in `.env` o `src/config/api.ts`
3. Se usi IP locale, verifica che backend sia su `--host 0.0.0.0`
4. Test manuale: apri `http://TUO_IP:8000/docs` nel browser del telefono

### Layout "Scavalla" Notch/Barra Navigazione
**Causa**: Safe area non applicata

**Soluzione**: Verifica che `index.html` abbia `viewport-fit=cover` e rebuilda.

### Gradle Sync Failed
**Causa**: Android SDK mancante o Java JDK non configurato

**Soluzione**:
1. Apri Android Studio
2. File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Installa Android SDK 33 o superiore
4. Verifica JDK: File → Project Structure → SDK Location

### APK Non Si Installa
**Causa**: Firma o permessi mancanti

**Soluzione**:
1. Abilita "Installa app sconosciute" per il file manager
2. Per produzione, crea keystore firmato

---

## 📚 Risorse

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Safe Area Insets](https://developer.mozilla.org/en-US/docs/Web/CSS/env)

---

## 🎯 Next Steps

1. ✅ Merge questo branch in `main` quando testato
2. 🚀 Deploy backend su Render/Railway
3. 📦 Build APK firmato per produzione
4. 🎨 Aggiungi icona e splash screen custom
5. 📱 Test su dispositivi fisici vari

---

**Happy Coding! 🔥**
