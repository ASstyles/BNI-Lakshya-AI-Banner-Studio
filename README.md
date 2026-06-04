# BNI Lakshya AI Banner Studio ✦

An elegant, premium, AI-powered web studio built specifically for **BNI Lakshya** chapter members and admins to generate brand-consistent, visual invitations and marketing banners in seconds.

---

## 🚀 Key Features

1. **Guided SPA Form Wizard:** Create professional posts for *Visitor Invites*, *Weekly Meetings*, and *Speaker Feature Presentations*.
2. **Dynamic Aspect Ratio Switching:** Generate banners in **Square (1:1)**, **Portrait (9:16)**, or **Landscape (16:9)** formats instantly.
3. **Double-Click Real-Time Editing:** Edit any text directly on the visual canvas preview. The exported image will capture your final customized text exactly.
4. **Crisp High-Resolution Export:** Integrated `html2canvas` configured with `scale: 3` and dynamic scaling overrides to output crystal-clear PNG files suitable for high-res mobile displays.
5. **AI Provider Router with Local Fallback:** Automatically attempts to call the **Gemini 1.5 Flash** API first. If no API key is set or the API fails, the backend seamlessly routes to a **Rule-Based Copy Generator** so the user flow never fails.
6. **In-Memory Rate Limiter:** Protects resources by blocking traffic after 50 AI requests per IP per hour.
7. **Client-Side History:** Generated banners are saved to the browser's `localStorage` to prevent corruption from concurrent write logs. Re-download or edit items directly from the History tab.
8. **Admin Panel:** Fully customizable colors, venue, time, and API keys stored securely in a local `data/settings.json` file.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, dotenv, @google/generative-ai
- **Frontend:** Vanilla HTML5, Vanilla CSS3 (custom CSS grid aspect ratio containers, glassmorphism UI, transitions), Vanilla JavaScript (modules)
- **Export Engine:** `html2canvas` (loaded via CDN)

---

## ⚙️ Quick Start Instructions

### Prerequisites
- Node.js installed (v18 or higher recommended)
- Internet connection (for Google Fonts, html2canvas CDN, and optional Gemini calls)

### Installation
1. Clone or download this project workspace.
2. In your terminal, navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the Express server:
   ```bash
   npm run start
   ```
   Or run in developer mode (auto-reload on save):
   ```bash
   npm run dev
   ```
2. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🔑 Access Codes

- **Chapter Access Code (Login):** `LAKSHYA2026`
- **Port:** Configured to run on port `3000` by default. Can be customized in `.env`.

---

## 🧪 Verification Tasks

Verify the implementation by running these checks:

1. **Verify Fallback Generator:**
   - Run the app without editing the `.env` file (Gemini API Key is empty by default).
   - Attempt to generate copy for a **Visitor Invite** for "Makeup Artist".
   - You should see the loader state resolve successfully to the copy screen using the *Local Fallback Engine* with correctly formatted BNI invitation copy.
2. **Verify High-DPI PNG Crispness:**
   - Set up your banner, choose a style (e.g. *Premium Corporate*), and click **Download PNG**.
   - Open the downloaded image, zoom to 200%, and check the text lines. The fonts will render crystal-clear (no pixelation or blur) due to the `scale: 3` rendering override.
3. **Verify Inline Direct Canvas Editing:**
   - In the Visual Preview screen, double-click the **Headline** directly inside the banner image.
   - Edit the text (e.g. change "BNI Lakshya Invites Makeup Artists" to "Join Us at BNI Lakshya this Thursday").
   - Click **Download PNG**. Inspect the file; the output PNG will contain your custom edits.
4. **Verify Long Text Wrapping:**
   - In the form, enter a very long category name (e.g. "Premium Smart Home Automation & Security Consultant").
   - Verify that the layout auto-wraps cleanly without overlapping components or falling out of the borders.
5. **Verify Rate Limiter:**
   - Rapidly click generate copy multiple times. The server protects itself and will return an HTTP 429 after 50 calls within an hour.
