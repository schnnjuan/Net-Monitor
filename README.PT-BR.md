# 🌐 NetMonitor: Malha de Inteligência Global & Liberdade de Rede

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![AI](https://img.shields.io/badge/Llama_3.1-70B-orange?style=for-the-badge&logo=meta)
![Redis](https://img.shields.io/badge/Upstash-Redis-red?style=for-the-badge&logo=redis)

O **NetMonitor** é uma plataforma de inteligência de alta densidade projetada para monitorar a liberdade na internet global em tempo real. Ao cruzar sinais técnicos de rede com eventos geopolíticos e imagens de satélite, o sistema distingue entre censura estatal, falhas de infraestrutura e conflitos físicos.

---

## 🚀 Camadas de Inteligência

O NetMonitor opera em três camadas críticas da internet global:

### 1. Camada Física (Submersa & Cinética)
- **Cabos Submarinos:** Visualização da espinha dorsal física de fibra óptica global.
- **NASA FIRMS:** Detecção em tempo real de anomalias térmicas (incêndios/explosões) próximas a infraestruturas críticas.
- **GDELT GKG:** Monitoramento de protestos físicos, rebeliões e conflitos armados no solo.

### 2. Camada Lógica (Roteamento & Tráfego)
- **IODA (CAIDA):** Detecção de quedas de tráfego em nível nacional via BGP e active probing.
- **RIPE Stat:** Monitoramento da visibilidade de prefixos BGP para detectar isolamento de rede.
- **Cloudflare Radar:** Tendências de tráfego Netflow e volume de ataques DDoS em tempo real.

### 3. Camada de Conteúdo (Censura & Segurança)
- **OONI (Tor Project):** Identificação de sites bloqueados, apps de mensagens (WhatsApp, Telegram) e ferramentas de evasão.
- **URLhaus:** Filtragem de segurança para distinguir entre censura política e bloqueios de malware/phishing.
- **GreyNoise:** Análise de atividade de IPs maliciosos e comportamento de botnets por país.

---

## 🧠 Análise Estratégica via IA

O sistema utiliza o modelo **Llama 3.1 70B** (via Groq) para realizar a correlação automatizada de sinais a cada 90 minutos. A IA identifica "padrões ocultos", como:
> *"Uma queda de tráfego de 40% na [Região] coincide com eventos térmicos de alta intensidade e protestos relatados, sugerindo dano intencional à infraestrutura ou shutdown ordenado pelo estado."*

---

## 🛠 Tecnologias Utilizadas

- **Frontend:** Next.js 15 (App Router), React-Globe.gl (Renderização 3D), Three.js, Tailwind CSS, Lucide React.
- **Backend:** Next.js Edge Runtime, SWR (Data Fetching), Groq SDK.
- **Infraestrutura:** Upstash Redis (Cache & Histórico), NASA GIBS (Serviços de Tiles).

---

## ⚙️ Configuração e Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/seuusuario/netmonitor.git
cd net-monitor
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente (`.env`)
Crie um arquivo `.env` na raiz do projeto:
```env
# AI Intelligence
GROQ_API_KEY=sua_chave_groq_aqui

# Cache & Histórico
UPSTASH_REDIS_REST_URL=sua_url_redis
UPSTASH_REDIS_REST_TOKEN=seu_token_redis

# Fontes de Dados
CLOUDFLARE_TOKEN=seu_token_cloudflare_radar
NASA_FIRMS_MAP_KEY=sua_chave_nasa_firms
```

---

## 🗺 Modos Interativos

- **Modo Globo 3D:** Visualização imersiva estilo "War Room" com texturas NASA Black Marble e perspectiva rotativa.
- **Modo Plano 2D:** Visão estratégica para análise rápida de todos os continentes simultaneamente.
- **Mural de Inteligência:** Um feed de alta densidade de cada incidente ativo, classificado por severidade e confiança.

---

## 🛡 Segurança e Resiliência
O NetMonitor implementa uma estratégia de **"No-Cache on Empty"** e padrões **Stale-While-Revalidate** para garantir que o painel continue funcional mesmo quando as APIs externas (IODA, GDELT) apresentarem instabilidade.

---

## 📜 Licença
Licença MIT. Dados fornecidos por OONI, CAIDA, NASA e TeleGeography.
