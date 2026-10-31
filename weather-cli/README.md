# Weather CLI — Rust Edition

Terminal port of the weather app's data layer (`src/utils/api.js` in the parent folder).
Same OpenWeatherMap API, same offline fallback simulator, same 5-day / hourly parsing.

## Run

```bash
cargo run -- Delhi
cargo run -- forecast Mumbai
cargo run -- save Tokyo
cargo run -- list
cargo run            # first saved location
```

## Features

- 🌡 Current conditions + feels-like, humidity, wind, visibility, pressure, sunrise/sunset
- 🫁 Air quality (AQI 1–5 with label + PM2.5 / PM10)
- 📅 5-day forecast (same midday-slot logic as `parseForecastToDays`)
- ⏱ Next 10 three-hour slots (same as `parseHourly`)
- 📍 Saved locations in `saved_locations.json`
- 🟡 **Offline simulation** — without an API key (or on network failure) it generates the
  same fake-but-realistic data as the web app's `createFallbackWeather`, using the same
  12 built-in known cities

## API key

Copy your key into `.env` next to `Cargo.toml` (already copied from the parent folder):

```
VITE_OWM_KEY=your_key
```

The web app in the parent folder is untouched and still works in the browser.
