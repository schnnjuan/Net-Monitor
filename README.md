# 🌐 NetMonitor: Global Network Intelligence & Freedom Mesh

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![AI](https://img.shields.io/badge/Llama_3.1-70B-orange?style=for-the-badge&logo=meta)
![Redis](https://img.shields.io/badge/Upstash-Redis-red?style=for-the-badge&logo=redis)

**NetMonitor** is a high-density intelligence platform designed to monitor global internet freedom in real-time. By cross-referencing technical network signals with geopolitical events and satellite imagery, it distinguishes between censorship, infrastructure failure, and kinetic conflict.

---

## 🚀 Core Intelligence Layers

NetMonitor operates across three critical layers of the global internet:

### 1. The Physical Layer (Submerged & Kinetic)
- **Submarine Cables:** Visualization of the global fiber-optic backbone.
- **NASA FIRMS:** Real-time detection of thermal anomalies (fires/explosions) near critical infrastructure.
- **ACLED/GDELT GKG:** Monitoring of physical protests, riots, and armed conflicts.

### 2. The Logical Layer (Routing & Traffic)
- **IODA (CAIDA):** Detection of national-level traffic drops via BGP and active probing.
- **RIPE Stat:** Monitoring BGP prefix visibility to detect routing-level isolation.
- **Cloudflare Radar:** Real-time Netflow trends and DDoS attack volume.

### 3. The Content Layer (Censorship & Security)
- **OONI (Tor Project):** Identification of blocked websites, messaging apps (WhatsApp, Telegram), and circumvention tools.
- **URLhaus:** Security filtering to distinguish between political censorship and malware/phishing blocks.
- **GreyNoise:** Analysis of malicious IP activity and botnet behavior.

---

## 🧠 AI-Driven Strategic Analysis

The system utilizes **Llama 3.1 70B** (via Groq) to perform automated signal correlation every 90 minutes. It identifies "hidden patterns," such as:
> *"A 40% traffic drop in [Region] correlates with high-intensity thermal events and reported protests, suggesting intentional infrastructure damage or state-mandated shutdown."*

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React-Globe.gl (3D Rendering), Three.js, Tailwind CSS, Lucide React.
- **Backend:** Next.js Edge Runtime, SWR (Data Fetching), Groq SDK.
- **Infrastructure:** Upstash Redis (Caching & History), NASA GIBS (Tile Services).

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/youruser/netmonitor.git
cd net-monitor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
# AI Intelligence
GROQ_API_KEY=your_groq_key_here

# Cache & History
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Data Sources
CLOUDFLARE_TOKEN=your_cloudflare_radar_token
NASA_FIRMS_MAP_KEY=your_nasa_firms_key
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🗺 Interactive Modes

- **3D Globe Mode:** Immersive "War Room" visualization with NASA Black Marble textures and rotating perspective.
- **2D Plane Mode:** Strategic overview for quick analysis of all global continents simultaneously.
- **Intelligence Wall:** A high-density feed of every active incident, classified by severity and confidence.

---

## 🛡 Security & Resilience
NetMonitor implements a **"No-Cache on Empty"** strategy and **Stale-While-Revalidate** patterns to ensure the dashboard remains functional even when upstream APIs (IODA, GDELT) experience downtime.

---

## 📜 License
MIT License. Data provided by OONI, CAIDA, NASA, and TeleGeography.
