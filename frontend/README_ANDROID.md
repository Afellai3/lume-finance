# 🔧 Fix Android Cleartext & API

## Problema Risolto

### 1. **Errore JSON "Unexpected token '<'…"**
**Causa**: L'app Android non raggiunge il backend perché:
- Android blocca HTTP cleartext per sicurezza
- Il codice non usa la configurazione API centralizzata

### 2. **Schermata Nera / App Freezata**
**Causa**: Fetch API fails silently, causando errori non gestiti

---

## ✅ Fix Applicati

### 1. Network Security Config
File: `android-resources/network_security_config.xml`
- Permette HTTP cleartext su IP locale (10.0.0.233, 192.168.x.x)
- Necessario per Android 9+

### 2. Capacitor Config Aggiornato
File: `capacitor.config.ts`
- `cleartext: true`
- `allowMixedContent: true`
- Riferimento a `network_security_config.xml`

### 3. API Config Centralizzata
File: `src/config/api.ts`
- Auto-detect Capacitor vs Web
- URL configurabile via `.env`

---

## 🚀 Come Applicare i Fix

### Step 1: Pull del Branch
```bash
cd C:\\Users\\utente\\Desktop\\lume-finance
git pull origin fix/android-cleartext
git checkout fix/android-cleartext
```

### Step 2: Verifica File `.env`
File: `frontend/.env`
```env
VITE_API_URL=http://10.0.0.233:8000
```

### Step 3: **IMPORTANTE - Cancella Vecchia Cartella Android**
```bash
cd frontend
rmdir /s /q android
```

Questo forza Capacitor a rigenerare tutto con i nuovi config!

### Step 4: Rebuilda Tutto
```bash
npm run build
npx cap add android  # Rigenera da zero
npx cap sync
```

### Step 5: Apri in Android Studio
```bash
npx cap open android
```

### Step 6: Verifica AndroidManifest.xml
In Android Studio, apri:
`android/app/src/main/AndroidManifest.xml`

Deve contenere:
```xml
<application
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

Se manca, aggiungilo manualmente.

### Step 7: Copia network_security_config.xml
Copia manualmente:
```
frontend/android-resources/network_security_config.xml
→
frontend/android/app/src/main/res/xml/network_security_config.xml
```

Se la cartella `xml/` non esiste, creala.

### Step 8: Rebuilda APK
In Android Studio: **Build → Build APK(s)**

---

## 🧪 Test

1. Verifica che backend sia avviato:
   ```bash
   cd backend
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Testa URL dal browser del telefono:
   `http://10.0.0.233:8000/docs`
   
   Deve aprire la documentazione FastAPI.

3. Installa APK e prova a creare movimento/conto.

---

## 🐛 Troubleshooting

### Ancora Errore JSON?
1. Verifica che `network_security_config.xml` sia in `android/app/src/main/res/xml/`
2. Verifica che AndroidManifest abbia `android:networkSecurityConfig`
3. Uninstalla vecchia APK e reinstalla la nuova
4. Controlla log Android Studio (Logcat)

### Backend Non Raggiungibile?
1. Test ping: `ping 10.0.0.233` dal telefono
2. Firewall Windows potrebbe bloccare - temporaneamente disabilitalo
3. Usa `ipconfig` per verificare IP

---

## 📌 Note

- ⚠️ `cleartext: true` è **solo per development**
- 🚀 Per produzione: deploya backend su HTTPS e rimuovi cleartext
- 🗂️ La cartella `android/` non va committata (è nel `.gitignore`)

---

**Buon Test! 🔥**
