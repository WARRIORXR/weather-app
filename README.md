# 🌤️ Weather App

A stunning, full-featured weather web application built with **Vanilla JS + Vite**, featuring glassmorphism design, dynamic weather-based gradients, animated SVG weather icons, and comprehensive weather data.

## ✨ Features

- 🌡️ **Real-time weather** — Current conditions with temperature, humidity, wind, pressure
- 📅 **5-Day Forecast** — Horizontal scrollable forecast cards
- ⏰ **Hourly Forecast** — Expandable Chart.js line graph with tooltips
- 🌫️ **Air Quality Index** — Circular progress ring with pollutant breakdown
- ☀️ **Sun & Moon** — Animated sun arc, sunrise/sunset, moon phases
- 💨 **Wind Compass** — Animated compass needle with gust warnings
- 👁️ **Visibility** — Bar graph + cloud coverage
- 📍 **Saved Locations** — Save up to 10 cities with live temps
- 🔍 **Search Autocomplete** — Debounced city search with country flags
- 📡 **GPS Support** — Auto-detect your location
- ⚙️ **Settings** — Unit toggles, themes, color schemes, animations
- 🎨 **Dynamic Backgrounds** — Changes gradient based on weather + day/night
- 💎 **Glassmorphism Design** — Frosted glass cards with backdrop blur
- 📱 **Fully Responsive** — Mobile-first design

## 🚀 Setup

### 1. Get an API Key

Sign up for a **free** OpenWeatherMap API key at [openweathermap.org/api](https://openweathermap.org/api).

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Key

Either:
- **Option A:** Copy `.env.example` to `.env` and paste your key:
  ```
  VITE_OWM_KEY=your_actual_api_key_here
  ```
- **Option B:** Enter the key directly in the app's **Settings** (⚙️) modal at runtime.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for Production

```bash
npm run build
```

## 🗂️ Project Structure

```
weather-app/
├── src/
│   ├── components/
│   │   ├── SearchBar.js       — Autocomplete search with GPS
│   │   ├── CurrentWeather.js  — Main weather card
│   │   ├── ForecastCard.js    — 5-day forecast strip
│   │   ├── HourlyForecast.js  — Hourly chart (Chart.js)
│   │   ├── WeatherDetails.js  — AQI, Sun/Moon, Wind, Visibility
│   │   ├── SavedLocations.js  — Saved cities panel
│   │   ├── SettingsModal.js   — Settings overlay
│   │   └── AlertBanner.js     — Weather alerts
│   ├── context/
│   │   └── WeatherState.js    — Global state (localStorage)
│   ├── utils/
│   │   ├── api.js             — OpenWeatherMap API calls
│   │   ├── helpers.js         — Formatters, conversions
│   │   ├── constants.js       — Color maps, weather codes
│   │   └── weatherIcons.js    — Pure CSS/SVG animated icons
│   ├── styles/
│   │   ├── globals.css        — All component styles
│   │   ├── variables.css      — CSS custom properties
│   │   └── animations.css     — Keyframe animations
│   ├── App.js                 — App orchestrator
│   └── main.js                — Entry point
├── index.html
├── vite.config.js
├── package.json
└── .env                       — API key (not in git)
```

## 🛠️ Tech Stack

- **Vite** — Build tool
- **Vanilla JS (ES Modules)** — No framework
- **Chart.js** — Hourly temperature chart
- **Axios** — HTTP client
- **Day.js** — Date formatting
- **OpenWeatherMap API** — Weather data
- **Vanilla CSS** — Full custom design system

## 📜 License

MIT License
