# Consently Browser Extension

The Consently Browser Extension is your personal privacy radar. It works in the background to detect data ingestion events, analyze privacy policies using AI, and sync everything back to your personal Sovereignty Hub (Dashboard).

## 🚀 Features

- **Real-time Detection**: Automatically detects when services (like Google, Meta, or SaaS tools) request your data permissions.
- **AI Policy Decoder**: Uses Gemini-powered analysis to turn complex legalese into clear, plain-language summaries.
- **One-Click Sync**: Seamlessly connects with your Consently Dashboard to provide a unified map of your digital footprint.
- **Stealth Mode Support**: Respects your global privacy settings configured in the dashboard.

---

## 🛠️ Installation (Developer Mode)

Since the extension is currently in development, you need to load it manually into your browser.

### 1. Build the Extension
First, navigate to the extension directory and install dependencies if you haven't already:

```bash
cd extension
npm install
```

Then, run the build script to generate the production-ready package:

```bash
npm run build
```

The build output will be located in the `extension/dist` folder.

### 2. Load into Chrome/Brave/Edge
1. Open your browser and navigate to `chrome://extensions/`.
2. Toggle **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** in the top left.
4. Select the `extension/dist` folder from the project directory.
5. The Consently icon should now appear in your extension bar. Pin it for easy access!

---

## 🔗 Connecting to the Dashboard

The extension needs to know which account to sync data to.

### Online Mode (Recommended)
1. Ensure your Consently Dashboard is running (either locally at `http://localhost:3000` or on your production URL).
2. Open the Consently extension popup.
3. If the extension is not yet connected, it will prompt you to sync with the dashboard.
4. Once you log into the dashboard in your browser, the extension will automatically pick up your session and start syncing events.

### Offline / Demo Mode
If you just want to test the UI without a backend:
1. Open the extension popup.
2. Select **"Try Demo Mode"**.
3. The extension will use a mocked user identity and store events locally without attempting to reach a server.

---

## 🛠️ Development

To work on the extension with hot-module reloading:

```bash
cd extension
npm run dev
```

This will start the Vite dev server. You will still need to load the `dist` folder into Chrome once; after that, changes to the code will automatically refresh the extension.

### Configuration
You can configure the dashboard connection URL in `extension/.env`:
```env
VITE_DASHBOARD_URL=https://consently.vercel.app
```

---

## 🛡️ Security & Privacy
Consently is built on the principle of **Zero-Knowledge Privacy**. We analyze content script-side where possible and only sync anonymized metadata to the dashboard. Your raw browsing history never leaves your device.
