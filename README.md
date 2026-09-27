# ⚡ ExtensionPulse — VS Code Extensions Analytics

A real-time analytics dashboard and competitive intelligence suite for the **Visual Studio Code Marketplace**. Track extension download velocity, analyze release cadence, forecast milestone growth, benchmark extensions side-by-side in the Battle Arena, and inspect publisher portfolios.

[![CI](https://github.com/Zaid-maker/Vscode-Extensions-Analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/Zaid-maker/Vscode-Extensions-Analytics/actions/workflows/ci.yml)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22c55e?style=for-the-badge&logo=d3.js&logoColor=white)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Key Features

### 🔍 1. Real-Time Market Explorer & Leaderboard
- **Direct Marketplace Querying**: Real-time integration with the official VS Code Marketplace Gallery API (`_apis/public/gallery/extensionquery`).
- **Ecosystem KPIs**: Combined install volume, download leader, top trending velocity, and average ecosystem rating.
- **Dynamic Sorting & Filtering**:
  - Filter by Category (*Programming Languages, Linters, Formatters, Themes & Icons, Debuggers, Git & SCM, Tools & Utilities*).
  - Sort by **Most Installed**, **Trending Today (24h)**, **Trending This Week (7d)**, **Trending This Month (30d)**, **Weighted Quality Rating**, **Highest Rated (Stars)**, or **Recently Updated**.
- **Dual Display Modes**: Toggle between an interactive **Card Grid** and a high-density **Data Table View**.
- **Quick-Picks**: 1-click preset chips for prominent extensions (*GitHub Copilot, Prettier, Python, ESLint, Tailwind CSS, GitLens, Docker, Ruff, Biome, C/C++*).

### 📊 2. Deep Dive Analytics & Forecasting
- **Distribution Flow**: Donut chart visualizing **Active Installs**, **User Updates Delivered**, and **Direct Web Downloads**.
- **Trending Velocity**: Multi-period bar chart comparing 24-hour, 7-day, and 30-day velocity indices.
- **Predictive Growth Trajectory**: Forecast install milestones (+30, +60, +90, +180, and +365 days) based on compound install velocity.
- **Milestone Tracker**: Visual progress bar tracking progress toward next major milestone (e.g. 50M -> 75M or 100M installs) with estimated days remaining and daily run-rate.
- **Release Cadence & Version Timeline**:
  - Quarterly release pace and average days between updates.
  - Release timeline histogram tracking version releases by year.
  - Complete version history table with version strings and target platform tags.
- **Shields.io Badge Generator**: 1-click copy markdown and HTML badges for downloads, star ratings, and version strings for your GitHub repository `README.md`.
- **VS Code CLI Command**: 1-click copy `code --install-extension <publisher>.<name>`.

### ⚔️ 3. Battle Arena (Side-by-Side Comparison)
- Benchmark **2 to 4 extensions simultaneously** on a single unified canvas.
- **Curated Matchups**:
  - 🤖 *AI Assistants*: **GitHub Copilot** vs **Codeium** vs **Continue**
  - 🪄 *Code Formatters*: **Prettier** vs **Biome**
  - 🐍 *Python Tooling*: **Python** vs **Astral Ruff**
  - 🎨 *Icon Themes*: **Material Icon Theme** vs **vscode-icons**
  - 🐙 *Git Superchargers*: **GitLens** vs **GitHub Pull Requests**
- **Automatic Winner Badges**: Identifies the leader in each category:
  - 🏆 *Most Downloaded*
  - ⭐ *Top Rated*
  - ⚡ *Fastest Trending*
- Side-by-side comparison charts for install volume and weekly velocity.

### 🏢 4. Publisher Intelligence
- Inspect publisher catalogs (e.g., **Microsoft**, **GitHub**, **Red Hat**, **Prettier Team**, **Astral**, **Biome Team**, **Philipp Kief**).
- Aggregate metrics: Total portfolio downloads, total active extensions, average rating across all items, and flagship dependency share (%).
- Interactive portfolio download share donut chart and full catalog table.

### ⭐ 5. Watchlist & Reporting Suite
- Save essential extensions to a persistent local watchlist (`localStorage`).
- **Data Export**: Export your saved extensions list as a **CSV Spreadsheet** or **JSON File** for offline analysis and reporting.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component architecture & declarative state orchestration |
| **Vite 8** | Ultra-fast development server and production bundler |
| **Tailwind CSS v4** | Modern styling, glassmorphism, and responsive layout |
| **Recharts** | Interactive charts (Pie/Donut, Bar, Area, and Progression) |
| **Lucide React** | Clean, consistent icons |
| **Bun** | High-performance runtime and package manager |

---

## 📁 Project Structure

```
vscode-extensions-analytics/
├── public/                     # Static assets & icons
├── src/
│   ├── components/             # UI Components
│   │   ├── Charts/             # Recharts visualization modules
│   │   │   ├── DistributionChart.jsx     # Installs vs Updates donut
│   │   │   ├── VelocityChart.jsx         # 24h, 7d, 30d trending bars
│   │   │   ├── ReleaseTimelineChart.jsx  # Version frequency histogram
│   │   │   └── GrowthProjectionChart.jsx # Future install curve
│   │   ├── Navbar.jsx          # Tab navigation & live refresh
│   │   ├── MetricCards.jsx     # Overview ecosystem metrics
│   │   ├── FilterBar.jsx       # Search, category pills, sort selector
│   │   ├── ExtensionCard.jsx   # Card representation
│   │   ├── ExtensionTable.jsx  # Dense tabular view
│   │   ├── ExtensionDetailModal.jsx # Deep dive analytics modal
│   │   ├── ComparisonArena.jsx # Battle Arena head-to-head matrix
│   │   ├── PublisherAnalytics.jsx # Publisher portfolio explorer
│   │   └── WatchlistView.jsx   # Bookmarks & CSV/JSON export
│   ├── data/
│   │   └── presets.js          # Categories, curated battles, publishers
│   ├── services/
│   │   └── marketplaceApi.js   # VS Code Gallery API caller & normalizer
│   ├── utils/
│   │   ├── badges.js           # Shields.io markdown/HTML badges
│   │   ├── formatters.js       # Number formatting, relative dates
│   │   └── projections.js      # Milestone & growth estimation models
│   ├── App.jsx                 # App root & state coordinator
│   ├── index.css               # Design tokens & glassmorphism utilities
│   └── main.jsx                # React root mount
├── package.json
├── vite.config.js              # Vite config with dev proxy for API
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or [Bun](https://bun.sh/) 1.1+ installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zaid-maker/Vscode-Extensions-Analytics.git
   cd Vscode-Extensions-Analytics
   ```

2. **Install dependencies:**
   Using Bun:
   ```bash
   bun install
   ```
   Or using npm:
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   bun run dev
   # or: npm run dev
   ```
   The application will be running at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   bun run build
   # or: npm run build
   ```

---

## 🌐 API & Architecture Details

The tool directly interfaces with the **Visual Studio Code Marketplace Gallery Query API**:
- **Endpoint**: `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery`
- **Method**: `POST`
- **Flags**: `914` (`0x200` IncludeLatestVersionOnly, `0x100` IncludeStatistics, `0x80` IncludeAssetUri, `0x10` IncludeVersionProperties, `0x2` IncludeFiles).
- **Proxy & Fallback**: Configured with a local Vite dev proxy (`/api/marketplace`) for seamless CORS handling, with automatic fallback directly to the official marketplace API endpoint.
- **In-Memory Caching**: Repeated queries are cached for 3 minutes to optimize network requests and ensure snappy navigation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
