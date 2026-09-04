# 🌤️ Weather App

<div align="center">

![Weather App](https://img.shields.io/badge/Weather%20App-Live-brightgreen?style=for-the-badge&logo=vercel)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

### 🚀 [**Live Demo → weather-app-ruby-six-13.vercel.app**](https://weather-app-ruby-six-13.vercel.app)

</div>

---

A stunning, full-featured weather web application built with **Vanilla JS + Vite**, featuring glassmorphism design, dynamic weather-based gradients, animated SVG weather icons, and comprehensive real-time weather data powered by the **OpenWeatherMap API**.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌡️ **Real-time Weather** | Current temperature, humidity, wind, pressure & more |
| 📅 **5-Day Forecast** | Horizontal scrollable forecast cards with icons |
| ⏰ **Hourly Forecast** | Expandable Chart.js line graph with interactive tooltips |
| 🌫️ **Air Quality Index** | Circular progress ring with PM2.5, PM10, O₃, NO₂ breakdown |
| ☀️ **Sun & Moon** | Animated sun arc, sunrise/sunset times, moon phase |
| 💨 **Wind Compass** | Animated compass needle with direction & gust warnings |
| 👁️ **Visibility** | Progress bar + cloud coverage percentage |
| 📍 **Saved Locations** | Save up to 10 cities with live temperatures |
| 🔍 **Search Autocomplete** | Debounced city search with country flag icons |
| 📡 **GPS Support** | Auto-detect your location with one click |
| ⚙️ **Settings Modal** | Unit toggles (°C/°F, km/h, hPa), themes, color schemes |
| 🎨 **Dynamic Backgrounds** | Gradient changes based on weather condition + day/night |
| 💎 **Glassmorphism Design** | Frosted glass cards with backdrop blur & micro-animations |
| 📱 **Fully Responsive** | Mobile-first design from 375px to 1920px |
| 🔒 **LocalStorage Persistence** | Settings and saved cities persist across sessions |

---

## 🖼️ Preview

> Live at: **[https://weather-app-ruby-six-13.vercel.app](https://weather-app-ruby-six-13.vercel.app)**

### 🌤️ Weather Conditions Supported
- ☀️ Sunny / Clear (animated rotating sun rays + glow)
- ⛅ Partly Cloudy (floating cloud layers)
- ☁️ Cloudy (multi-layer cloud animation)
- 🌧️ Rainy (falling rain streak animation)
- ❄️ Snowy (swaying snowflakes with rotation)
- ⛈️ Thunderstorm (lightning flash + rain + shake effect)
- 🌫️ Mist / Fog (drifting horizontal lines)
- 🌙 Clear Night (twinkling stars + floating moon)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/WARRIORXR/weather-app.git
cd weather-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — the app uses the bundled API key and works immediately!

### 4. Build for production

```bash
npm run build
```

---

## 🗂️ Project Structure

```
weather-app/
├── index.html                 — Root HTML with SEO meta tags
├── vite.config.js             — Vite configuration
├── .env                       — API key
├── src/
│   ├── App.js                 — Main app orchestrator
│   ├── main.js                — Entry point
│   ├── components/
│   │   ├── SearchBar.js       — Autocomplete search with GPS
│   │   ├── CurrentWeather.js  — Main weather card
│   │   ├── ForecastCard.js    — 5-day forecast strip
│   │   ├── HourlyForecast.js  — Hourly chart (Chart.js)
│   │   ├── WeatherDetails.js  — AQI, Sun/Moon, Wind, Visibility
│   │   ├── SavedLocations.js  — Saved cities panel
│   │   ├── SettingsModal.js   — Settings overlay modal
│   │   └── AlertBanner.js     — Weather alert banner
│   ├── context/
│   │   └── WeatherState.js    — Global state (localStorage-backed)
│   ├── utils/
│   │   ├── api.js             — OpenWeatherMap API calls & parsers
│   │   ├── helpers.js         — Temperature, wind, date formatters
│   │   ├── constants.js       — Gradient maps, weather condition codes
│   │   └── weatherIcons.js    — 9 pure CSS/SVG animated weather icons
│   └── styles/
│       ├── globals.css        — All component styles
│       ├── variables.css      — CSS custom properties design system
│       └── animations.css     — 25+ CSS keyframe animations
└── package.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Vite** | Build tool & dev server |
| **Vanilla JS (ES Modules)** | Core logic, no framework needed |
| **Chart.js 4** | Hourly temperature line chart |
| **Axios** | HTTP client for API calls |
| **Day.js** | Lightweight date/time formatting |
| **OpenWeatherMap API** | Real-time weather, forecasts, AQI |
| **Vanilla CSS** | Full custom design system with CSS variables |

---

## 🎨 Design System

- **Colors:** Weather-adaptive gradients (sunny/cloudy/rainy/snowy/night)
- **Typography:** Inter + Poppins from Google Fonts
- **Cards:** Glassmorphism with `backdrop-filter: blur(20px)`
- **Animations:** 25+ CSS keyframes (shimmer, fadeInScale, pulse, rain, snow, lightning...)
- **Responsive:** CSS Grid + Flexbox, mobile breakpoints at 480px, 768px, 1100px

---

## 🌐 Deployment

This app is deployed on **Vercel**:

🔗 **[https://weather-app-ruby-six-13.vercel.app](https://weather-app-ruby-six-13.vercel.app)**

To deploy your own:
```bash
npm i -g vercel
vercel --prod
```

---

## 📜 License

MIT License — feel free to use, modify, and deploy.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/WARRIORXR">WARRIORXR</a>
</div>
