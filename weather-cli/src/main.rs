//! Weather CLI — Rust port of the Vite/React weather app's data layer
//! (`src/utils/api.js` + `src/utils/helpers.js` daily/hourly parsing).
//!
//! Same OpenWeatherMap endpoints, same offline fallback simulator,
//! same 5-day / 10-slot parsing — now in the terminal.
//!
//! Usage:
//!   weather-cli <city>              current weather + AQI for a city
//!   weather-cli forecast <city>     5-day forecast + next 10 slots
//!   weather-cli save <city>         add to saved locations
//!   weather-cli remove <city>       remove from saved locations
//!   weather-cli list                show saved locations
//!
//! Set OWM_KEY (or VITE_OWM_KEY) in `.env` next to Cargo.toml for live data;
//! without a key it runs the same built-in simulation as the web app.

use std::time::Duration;

use chrono::{Datelike, TimeZone, Timelike, Utc};
use serde_json::{json, Value};

const API_BASE: &str = "https://api.openweathermap.org";
const SAVED_FILE: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/saved_locations.json");

/// Built-in known cities for instant fallback / offline search (from api.js)
const KNOWN_CITIES: [(&str, &str, &str, f64, f64, f64, i64, &str); 12] = [
    ("London", "GB", "England", 51.5074, -0.1278, 18.0, 802, "scattered clouds"),
    ("New York", "US", "New York", 40.7128, -74.0060, 22.0, 800, "clear sky"),
    ("Tokyo", "JP", "Tokyo", 35.6762, 139.6503, 24.0, 801, "few clouds"),
    ("Paris", "FR", "Île-de-France", 48.8566, 2.3522, 20.0, 803, "broken clouds"),
    ("Mumbai", "IN", "Maharashtra", 19.0760, 72.8777, 30.0, 500, "light rain"),
    ("Sydney", "AU", "New South Wales", -33.8688, 151.2093, 17.0, 800, "clear sky"),
    ("San Francisco", "US", "California", 37.7749, -122.4194, 16.0, 701, "mist"),
    ("Dubai", "AE", "Dubai", 25.2048, 55.2708, 36.0, 800, "clear sky"),
    ("Singapore", "SG", "Singapore", 1.3521, 103.8198, 29.0, 521, "shower rain"),
    ("Berlin", "DE", "Berlin", 52.5200, 13.4050, 19.0, 802, "scattered clouds"),
    ("Toronto", "CA", "Ontario", 43.6532, -79.3832, 21.0, 801, "few clouds"),
    ("Delhi", "IN", "Delhi", 28.6139, 77.2090, 33.0, 721, "haze"),
];

const AQI_LABELS: [(&str, i64); 5] = [
    ("Good", 1),
    ("Fair", 2),
    ("Moderate", 3),
    ("Poor", 4),
    ("Very Poor", 5),
];

struct WeatherClient {
    key: String,
    http: reqwest::Client,
}

// ── Offline fallback simulator (port of createFallbackWeather) ──

fn fallback_for(city: Option<&str>) -> (Value, Value, Value) {
    let (name, country, lat, lon, temp, condition, desc) = match city {
        Some(c) => KNOWN_CITIES
            .iter()
            .find(|k| k.0.eq_ignore_ascii_case(c.trim()))
            .map(|k| (k.0, k.1, k.3, k.4, k.5, k.6, k.7))
            .unwrap_or((c.trim(), "GB", 51.5074, -0.1278, 20.0, 801, "partly cloudy")),
        None => ("London", "GB", 51.5074, -0.1278, 18.0, 802, "scattered clouds"),
    };

    let now_sec = Utc::now().timestamp();
    let sunrise = now_sec - 21600; // 6 hours ago
    let sunset = now_sec + 21600; // 6 hours from now
    let tz = (lon * 240.0).round() as i64; // approximate timezone in seconds

    let main_kind = if desc.contains("rain") {
        "Rain"
    } else if desc.contains("cloud") {
        "Clouds"
    } else {
        "Clear"
    };

    let current = json!({
        "coord": { "lon": lon, "lat": lat },
        "weather": [{
            "id": condition,
            "main": main_kind,
            "description": desc,
            "icon": if now_sec >= sunrise && now_sec < sunset { "02d" } else { "02n" },
        }],
        "main": {
            "temp": temp,
            "feels_like": temp - 1.2,
            "temp_min": temp - 4.0,
            "temp_max": temp + 4.0,
            "pressure": 1014,
            "humidity": 62,
        },
        "visibility": 10000,
        "wind": { "speed": 4.2, "deg": 210, "gust": 6.5 },
        "clouds": { "all": 40 },
        "dt": now_sec,
        "sys": { "country": country, "sunrise": sunrise, "sunset": sunset },
        "timezone": tz,
        "id": 999999,
        "name": name,
        "cod": 200,
        "isSimulation": true,
    });

    // Generate 40 3-hour forecast slots
    let mut forecast_list = Vec::with_capacity(40);
    for i in 0..40 {
        let slot_time = now_sec + i * 3 * 3600;
        let hour = Utc.timestamp_opt(slot_time, 0).unwrap().hour();
        let temp_offset = ((hour as f64 - 8.0) * (std::f64::consts::PI / 12.0)).sin() * 4.0;
        let slot_temp = ((temp + temp_offset) * 10.0).round() / 10.0;
        let is_day_slot = (6..=19).contains(&hour);
        forecast_list.push(json!({
            "dt": slot_time,
            "main": {
                "temp": slot_temp,
                "feels_like": slot_temp - 1.0,
                "temp_min": slot_temp - 2.0,
                "temp_max": slot_temp + 2.0,
                "pressure": 1013 + (i as f64).sin().round() as i64 * 3,
                "humidity": (60 + (i as f64).sin().round() as i64 * 20).clamp(30, 95),
            },
            "weather": [{
                "id": condition,
                "main": if desc.contains("rain") { "Rain" } else { "Clouds" },
                "description": desc,
                "icon": if is_day_slot { "02d" } else { "02n" },
            }],
            "clouds": { "all": 35 + (i % 3) * 15 },
            "wind": { "speed": 3.5 + (i % 4) as f64 * 0.8, "deg": 180 + i * 5 },
            "visibility": 10000,
            "pop": if (500..600).contains(&condition) { 0.65 } else { 0.15 },
        }));
    }

    let forecast = json!({
        "cod": "200",
        "cnt": 40,
        "list": forecast_list,
        "city": {
            "name": name,
            "coord": { "lat": lat, "lon": lon },
            "country": country,
            "timezone": tz,
            "sunrise": sunrise,
            "sunset": sunset,
        },
        "isSimulation": true,
    });

    let aqi = json!({
        "coord": [lon, lat],
        "list": [{
            "dt": now_sec,
            "main": { "aqi": 2 },
            "components": {
                "co": 260.4, "no": 0.1, "no2": 12.8, "o3": 54.2,
                "so2": 3.1, "pm2_5": 11.4, "pm10": 22.8, "nh3": 0.9,
            }
        }],
        "isSimulation": true,
    });

    (current, forecast, aqi)
}

// ── HTTP client with single retry (port of requestWithRetry) ──

impl WeatherClient {
    async fn get(&self, path: &str, params: &[(&str, String)]) -> Result<Value, String> {
        let url = format!("{API_BASE}{path}");
        for attempt in 0..2 {
            let result = self
                .http
                .get(&url)
                .query(params)
                .timeout(Duration::from_secs(6))
                .send()
                .await;
            match result {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() {
                        return resp
                            .json::<Value>()
                            .await
                            .map_err(|e| format!("bad JSON: {e}"));
                    }
                    if status.as_u16() >= 500 && attempt == 0 {
                        tokio::time::sleep(Duration::from_millis(600)).await;
                        continue;
                    }
                    return Err(format!("HTTP {status}"));
                }
                Err(_) if attempt == 0 => {
                    tokio::time::sleep(Duration::from_millis(600)).await;
                    continue;
                }
                Err(e) => return Err(e.to_string()),
            }
        }
        unreachable!()
    }

    /// Live fetch with the same graceful fallback as the web app.
    async fn complete(&self, city: Option<&str>) -> (Value, Value, Value, bool) {
        if self.key.is_empty() {
            eprintln!("(no API key — using built-in simulation)");
            let (c, f, a) = fallback_for(city);
            return (c, f, a, false);
        }
        let (current, forecast) = match city {
            Some(c) => {
                let base = vec![
                    ("q", c.to_string()),
                    ("appid", self.key.clone()),
                    ("units", "metric".to_string()),
                ];
                let mut fc = base.clone();
                fc.push(("cnt", "40".to_string()));
                tokio::join!(self.get("/data/2.5/weather", &base), self.get("/data/2.5/forecast", &fc))
            }
            None => return {
                eprintln!("(no city — using built-in simulation)");
                let (c, f, a) = fallback_for(None);
                (c, f, a, false)
            },
        };

        match (current, forecast) {
            (Ok(cur), Ok(fc)) => {
                let lat = cur["coord"]["lat"].as_f64().unwrap_or(0.0);
                let lon = cur["coord"]["lon"].as_f64().unwrap_or(0.0);
                let aqi_params = [
                    ("lat", lat.to_string()),
                    ("lon", lon.to_string()),
                    ("appid", self.key.clone()),
                ];
                // Non-critical fallback for AQI
                let aqi = self
                    .get("/data/2.5/air_pollution", &aqi_params)
                    .await
                    .unwrap_or_else(|_| {
                        json!({ "list": [{ "main": { "aqi": 2 }, "components": { "pm2_5": 12.5, "pm10": 24.1, "o3": 52.0, "no2": 15.2 } }] })
                    });
                (cur, fc, aqi, true)
            }
            (Err(e), _) | (_, Err(e)) => {
                eprintln!("API fetch failed ({e}) — using resilient fallback");
                let (c, f, a) = fallback_for(city);
                (c, f, a, false)
            }
        }
    }
}

// ── Parsing (ports of parseForecastToDays / parseHourly) ────

fn day_key(dt: i64) -> String {
    let d = Utc.timestamp_opt(dt, 0).unwrap();
    format!("{}-{}-{}", d.year(), d.month0(), d.day0())
}

fn parse_days(forecast: &Value) -> Vec<Value> {
    let list = match forecast["list"].as_array() {
        Some(l) => l,
        None => return vec![],
    };
    let mut by_day: Vec<(String, Vec<&Value>)> = Vec::new();
    for item in list {
        let key = day_key(item["dt"].as_i64().unwrap_or(0));
        match by_day.iter_mut().find(|(k, _)| *k == key) {
            Some((_, items)) => items.push(item),
            None => by_day.push((key, vec![item])),
        }
    }
    by_day
        .into_iter()
        .take(5)
        .map(|(_, items)| {
            let midday = items
                .iter()
                .find(|i| {
                    let h = Utc.timestamp_opt(i["dt"].as_i64().unwrap_or(0), 0)
                        .unwrap()
                        .hour() as i64;
                    (11..=14).contains(&h)
                })
                .copied()
                .unwrap_or(items[items.len() / 2]);
            let temps: Vec<f64> = items
                .iter()
                .map(|i| i["main"]["temp"].as_f64().unwrap_or(0.0))
                .collect();
            let pop = items
                .iter()
                .map(|i| i["pop"].as_f64().unwrap_or(0.0))
                .fold(0.0_f64, f64::max);
            json!({
                "dt": midday["dt"],
                "high": temps.iter().cloned().fold(f64::MIN, f64::max),
                "low": temps.iter().cloned().fold(f64::MAX, f64::min),
                "icon": midday["weather"][0]["icon"].clone(),
                "description": midday["weather"][0]["description"].clone(),
                "condition": midday["weather"][0]["id"].clone(),
                "pop": pop,
                "wind": midday["wind"]["speed"].clone(),
                "humidity": midday["main"]["humidity"].clone(),
            })
        })
        .collect()
}

fn parse_hourly(forecast: &Value) -> Vec<Value> {
    match forecast["list"].as_array() {
        Some(list) => list.iter().take(10).cloned().collect(),
        None => vec![],
    }
}

// ── Display helpers ─────────────────────────────────────────

fn hh_mm(ts: i64, tz_offset: i64) -> String {
    Utc.timestamp_opt(ts + tz_offset, 0)
        .unwrap()
        .format("%H:%M")
        .to_string()
}

fn day_name(dt: i64) -> String {
    Utc.timestamp_opt(dt, 0).unwrap().format("%a %d %b").to_string()
}

fn clock_time(dt: i64) -> String {
    Utc.timestamp_opt(dt, 0).unwrap().format("%d %b %H:%M").to_string()
}

fn aqi_label(v: i64) -> &'static str {
    AQI_LABELS
        .iter()
        .find(|(_, n)| *n == v.clamp(1, 5))
        .map(|(l, _)| *l)
        .unwrap_or("Unknown")
}

fn show_current(current: &Value, aqi: &Value, is_live: bool) {
    let name = current["name"].as_str().unwrap_or("?");
    let country = current["sys"]["country"].as_str().unwrap_or("");
    let w = &current["weather"][0];
    let tz = current["timezone"].as_i64().unwrap_or(0);
    let dt = current["dt"].as_i64().unwrap_or(0);
    println!();
    println!(
        "🌍 {}{}  —  {}",
        name,
        if country.is_empty() { String::new() } else { format!(", {country}") },
        clock_time(dt)
    );
    println!("   {}", if is_live { "🟢 live data" } else { "🟡 simulated data" });
    println!(
        "🌡  {:.1}°C  (feels {:.1}°C)   {} — {}",
        current["main"]["temp"].as_f64().unwrap_or(0.0),
        current["main"]["feels_like"].as_f64().unwrap_or(0.0),
        w["main"].as_str().unwrap_or(""),
        w["description"].as_str().unwrap_or("")
    );
    println!(
        "💧 Humidity {}%   🌬  Wind {:.1} m/s   ☁  Clouds {}%",
        current["main"]["humidity"].as_i64().unwrap_or(0),
        current["wind"]["speed"].as_f64().unwrap_or(0.0),
        current["clouds"]["all"].as_i64().unwrap_or(0)
    );
    println!(
        "🔽 {:.1}°  🔼 {:.1}°   👁  {} km   🧭 {} hPa",
        current["main"]["temp_min"].as_f64().unwrap_or(0.0),
        current["main"]["temp_max"].as_f64().unwrap_or(0.0),
        current["visibility"].as_i64().unwrap_or(0) / 1000,
        current["main"]["pressure"].as_i64().unwrap_or(0)
    );
    println!(
        "🌅 {}   🌇 {}",
        hh_mm(current["sys"]["sunrise"].as_i64().unwrap_or(0), tz),
        hh_mm(current["sys"]["sunset"].as_i64().unwrap_or(0), tz)
    );
    let entry = &aqi["list"][0];
    let a = entry["main"]["aqi"].as_i64().unwrap_or(2);
    println!(
        "🫁 AQI {} ({})   PM2.5 {:.1}   PM10 {:.1}",
        a,
        aqi_label(a),
        entry["components"]["pm2_5"].as_f64().unwrap_or(0.0),
        entry["components"]["pm10"].as_f64().unwrap_or(0.0)
    );
}

fn show_forecast(forecast: &Value) {
    println!();
    println!("📅 5-day forecast:");
    println!("{:<12}{:>7}{:>7}{:>7}{:>9}{:>8}", "day", "high", "low", "rain%", "wind", "hum");
    for day in parse_days(forecast) {
        println!(
            "{:<12}{:>6.1}°{:>6.1}°{:>6.0}%{:>7.1}m/s{:>7}%",
            day_name(day["dt"].as_i64().unwrap_or(0)),
            day["high"].as_f64().unwrap_or(0.0),
            day["low"].as_f64().unwrap_or(0.0),
            day["pop"].as_f64().unwrap_or(0.0) * 100.0,
            day["wind"].as_f64().unwrap_or(0.0),
            day["humidity"].as_i64().unwrap_or(0),
        );
        println!("             {}", day["description"].as_str().unwrap_or(""));
    }

    println!();
    println!("⏱  Next 10 slots (3-hourly):");
    for slot in parse_hourly(forecast) {
        println!(
            "   {:<14}{:>6.1}°  🌧 {:>2.0}%  {}",
            clock_time(slot["dt"].as_i64().unwrap_or(0)),
            slot["main"]["temp"].as_f64().unwrap_or(0.0),
            slot["pop"].as_f64().unwrap_or(0.0) * 100.0,
            slot["weather"][0]["description"].as_str().unwrap_or(""),
        );
    }
}

// ── Saved locations ─────────────────────────────────────────

fn load_saved() -> Vec<String> {
    std::fs::read_to_string(SAVED_FILE)
        .ok()
        .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
        .unwrap_or_default()
}

fn store_saved(list: &[String]) {
    let _ = std::fs::write(SAVED_FILE, serde_json::to_string_pretty(list).unwrap());
}

fn print_help() {
    println!(
        "Weather CLI (Rust port of the weather app data layer)\n\
         \n\
         USAGE:\n\
           weather-cli <city>            current weather + AQI\n\
           weather-cli forecast <city>   5-day + 10-slot forecast\n\
           weather-cli save <city>       save a location\n\
           weather-cli remove <city>     remove a saved location\n\
           weather-cli list              list saved locations\n\
           weather-cli (no args)         show weather for first saved city\n\
         \n\
         API key: set OWM_KEY or VITE_OWM_KEY in the .env next to Cargo.toml.\n\
         Without a key you get the built-in simulation, same as the web app."
    );
}

#[tokio::main]
async fn main() {
    // Load .env from the project folder regardless of the current directory
    let _ = dotenvy::from_path(concat!(env!("CARGO_MANIFEST_DIR"), "/.env"));
    let _ = dotenvy::dotenv();
    let key = std::env::var("OWM_KEY")
        .or_else(|_| std::env::var("VITE_OWM_KEY"))
        .unwrap_or_default()
        .trim()
        .to_string();
    let client = WeatherClient {
        key,
        http: reqwest::Client::new(),
    };

    let args: Vec<String> = std::env::args().skip(1).collect();
    let (cmd, city) = match args.split_first() {
        None => ("current", load_saved().into_iter().next()),
        Some((first, rest)) => {
            let joined = rest.join(" ");
            let joined_opt = if joined.trim().is_empty() { None } else { Some(joined) };
            match first.as_str() {
                "forecast" => ("forecast", joined_opt),
                "save" => ("save", joined_opt),
                "remove" => ("remove", joined_opt),
                "list" => ("list", None),
                "help" | "--help" | "-h" => ("help", None),
                _ => ("current", Some(args.join(" "))),
            }
        }
    };

    match (cmd, city) {
        ("help", _) => print_help(),
        ("list", _) => match load_saved() {
            list if list.is_empty() => println!("No saved locations yet. Try: weather-cli save Delhi"),
            list => {
                println!("📍 Saved locations:");
                for c in &list {
                    println!("   • {c}");
                }
            }
        },
        ("save", Some(city)) => {
            let mut list = load_saved();
            if list.iter().any(|c| c.eq_ignore_ascii_case(&city)) {
                println!("'{city}' is already saved.");
            } else {
                list.push(city.clone());
                store_saved(&list);
                println!("💾 Saved '{city}'.");
            }
        }
        ("remove", Some(city)) => {
            let mut list = load_saved();
            let before = list.len();
            list.retain(|c| !c.eq_ignore_ascii_case(&city));
            if list.len() == before {
                println!("'{city}' was not in saved locations.");
            } else {
                store_saved(&list);
                println!("🗑  Removed '{city}'.");
            }
        }
        ("forecast", Some(city)) => {
            let (current, forecast, _aqi, is_live) = client.complete(Some(&city)).await;
            show_current(&current, &json!({"list":[{}]}), is_live);
            show_forecast(&forecast);
        }
        ("current", Some(city)) => {
            let (current, _forecast, aqi, is_live) = client.complete(Some(&city)).await;
            show_current(&current, &aqi, is_live);
        }
        (other, city) => {
            eprintln!("Missing city for '{other}'." );
            if city.is_none() {
                print_help();
            }
        }
    }
}
