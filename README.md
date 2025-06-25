# DB Visualizer Pro

Un database visualizer locale moderno con interfaccia intuitiva per gestire database MySQL. Progettato come alternativa moderna a PHPMyAdmin con una UI/UX migliorata.

## 🚀 Caratteristiche

- **Interfaccia Moderna**: Design pulito e intuitivo con supporto per dark mode
- **Gestione Connessioni**: Test e gestione semplificata delle connessioni database
- **Visualizzazione Dati**: Tabelle responsive e interattive per i dati
- **Query Editor**: Editor SQL con syntax highlighting e auto-completamento
- **Multi-Database**: Supporto per più database contemporaneamente
- **Sicurezza**: Connessioni sicure con context isolation di Electron
- **Performance**: Architettura ottimizzata per grandi dataset

## 🏗️ Architettura del Progetto

```
my-db-visualizer/
├── src/
│   ├── main/                   # Electron main process
│   │   └── index.js           # Main entry point
│   ├── preload/               # Preload scripts
│   │   └── index.js          # API bridge sicura
│   └── renderer/             # Frontend Vue.js
│       ├── components/       # Componenti riutilizzabili
│       ├── views/           # Pagine principali
│       ├── stores/          # State management (Pinia)
│       ├── types/           # TypeScript definitions
│       ├── utils/           # Utility functions
│       ├── App.vue          # Componente root
│       ├── main.ts          # Entry point Vue
│       └── style.css        # Stili globali
├── forge.config.js          # Configurazione Electron Forge
├── vite.config.js          # Configurazione Vite
├── tailwind.config.js      # Configurazione Tailwind CSS
└── tsconfig.json           # Configurazione TypeScript
```

## 🛠️ Stack Tecnologico

### Backend (Electron Main Process)

- **Electron**: Framework per app desktop
- **mysql2**: Driver MySQL nativo con promise support
- **IPC Communication**: Comunicazione sicura tra main e renderer

### Frontend (Renderer Process)

- **Vue.js 3**: Framework reattivo con Composition API
- **TypeScript**: Type safety e sviluppo robusto
- **Vite**: Build tool veloce e moderno
- **Pinia**: State management moderno per Vue
- **Vue Router**: Routing client-side
- **VueUse**: Utilities reattive

### UI/UX

- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Componenti accessibili headless
- **Heroicons**: Icone SVG ottimizzate
- **Dark Mode**: Supporto nativo per tema scuro

### Development

- **ESLint**: Linting per codice pulito
- **PostCSS**: Processing CSS avanzato
- **Electron Forge**: Packaging e distribuzione

## 📦 Setup e Installazione

### Prerequisiti

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL Server locale (es. DBngin, XAMPP, MAMP)

### Installazione

```bash
# Clone del repository
git clone https://github.com/francescosisti/db-visualizer-pro.git
cd my-db-visualizer

# Installazione dipendenze
npm install

# Avvio in modalità sviluppo
npm run dev
```

### Comandi Disponibili

```bash
# Sviluppo
npm run dev              # Avvia app in development mode
npm run dev:renderer     # Solo server Vite (per debug frontend)

# Build e Packaging
npm run build           # Build completo del progetto
npm run build:renderer  # Build solo del frontend
npm run package         # Crea package Electron
npm run make           # Crea distributables

# Qualità del Codice
npm run lint           # Esegue ESLint
npm run lint:fix       # Fix automatico problemi ESLint
npm run type-check     # Verifica tipi TypeScript
```

## 🎯 Funzionalità Pianificate

### Fase 1 - Core Features (Completata)

- [x] Architettura base del progetto
- [x] Setup Electron + Vue.js + TypeScript
- [x] Sistema di connessione database
- [x] Interfaccia utente moderna
- [x] State management con Pinia

### Fase 2 - Database Management

- [ ] Visualizzazione struttura database
- [ ] Browse tabelle con paginazione
- [ ] Operazioni CRUD sui dati
- [ ] Import/Export dati (CSV, JSON, SQL)

### Fase 3 - Advanced Features

- [ ] Query builder visuale
- [ ] Performance monitoring
- [ ] Backup e restore database
- [ ] Schema designer visuale

### Fase 4 - Extra Features

- [ ] Plugin system
- [ ] Connessioni multiple simultanee
- [ ] Syntax highlighting avanzato
- [ ] Auto-completion intelligente

## 🔒 Sicurezza

Il progetto implementa le best practices di sicurezza per Electron:

- **Context Isolation**: Renderer process isolato dal main process
- **Preload Scripts**: API sicure esposte tramite contextBridge
- **No Node Integration**: Renderer non ha accesso diretto a Node.js APIs
- **CSP**: Content Security Policy implementata
- **Sanitization**: Input sanitization per prevenire SQL injection

## 🎨 Design System

### Color Palette

```css
Primary: #3B82F6 (Blue)
Gray Scale: #F9FAFB → #030712
Success: #10B981 (Green)
Warning: #F59E0B (Yellow)
Error: #EF4444 (Red)
```

### Typography

- **Primary**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

### Spacing

Sistema basato su multipli di 4px (Tailwind default)

## 🤝 Contribuzione

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👨‍💻 Autore

**Francesco Sisti**

- Email: francescosisti61@gmail.com
- GitHub: [@francescosisti](https://github.com/francescosisti)

---

_Progetto creato per fornire un'alternativa moderna e intuitiva a PHPMyAdmin per la gestione di database MySQL locali._
