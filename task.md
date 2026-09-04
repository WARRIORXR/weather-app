🌤️ Weather App - Complete Design & Development Prompts
1. Hero/Main Display Screen Prompt 🎨
text

Create a stunning weather app main screen:
- Background: Dynamic gradient that changes based on weather conditions
  * Sunny: Orange to yellow gradient (#FF6B35 to #F7931E)
  * Cloudy: Gray to blue gradient (#4A5568 to #2D3748)
  * Rainy: Dark blue to purple (#1E3A8A to #5B21B6)
  * Night: Deep purple to black (#1E1B4B to #0F172A)
- Center focal point: Large animated weather icon (300x300px)
- Temperature display: Giant bold numbers (120px font) in white
- Glass morphism card overlay (rgba(255,255,255,0.15))
- Backdrop blur: 20px for depth
- Location pin icon with city name (32px font)
- Subtle floating particles matching weather (rain drops, snowflakes, sun rays)
- Smooth gradient animation transitioning between weather states
- Rounded corners: 24px on all cards
- Shadow: 0 8px 32px rgba(0,0,0,0.3)
- Responsive: Mobile-first design, 375px to 1920px
- Style: Modern, clean, minimalist with depth
2. Search Bar Design Prompt 🔍
text

Design an elegant search interface:
- Width: 90% max-width 600px, centered
- Height: 60px
- Background: Frosted glass effect (rgba(255,255,255,0.2))
- Border: 2px solid rgba(255,255,255,0.3)
- Border radius: 30px (pill shape)
- Input field: Transparent background, white text, placeholder gray
- Search icon: Magnifying glass on left (24px, white)
- GPS location button on right with pulsing animation
- Autocomplete dropdown: Glass morphism cards appearing below
- Hover effect: Border glows with subtle white shadow
- Focus state: Border brightens to rgba(255,255,255,0.5)
- Dropdown suggestions: Each city with country flag icon
- Typography: 18px, 'Inter' or 'Poppins' font
- Smooth slide-down animation for results (0.3s ease)
3. Current Weather Card Prompt ☀️
text

Create a comprehensive current weather display card:
- Dimensions: 450px width x 550px height on desktop
- Layout: Vertically stacked, centered content
- Top section: 
  * City name with country flag (36px bold)
  * Current date and time with auto-update
  * "Last updated" timestamp in light gray
- Middle section:
  * Animated weather icon (Lottie animation preferred)
  * Temperature in massive font (96px)
  * "Feels like" temperature below (24px)
  * Weather description (e.g., "Partly Cloudy") (28px)
- Bottom section - Info grid (2x2):
  * Humidity with droplet icon
  * Wind speed with wind icon
  * Pressure with gauge icon
  * UV Index with sun icon
- Each metric: Icon (32px) + Label + Value
- Background: Gradient based on temperature
  * Cold (<10°C): Blue gradient
  * Moderate (10-25°C): Green to blue
  * Hot (>25°C): Orange to red
- Card animation: Fade in with scale effect on data update
- Unit toggle button: °C/°F switch with smooth transition
4. 5-Day Forecast Section Prompt 📅
text

Design a horizontal scrollable forecast section:
- Container: Full width with horizontal scroll on mobile
- Individual forecast cards: 200px x 280px
- Card design:
  * Semi-transparent background (rgba(255,255,255,0.1))
  * Backdrop filter: blur(10px)
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border radius: 16px
  * Padding: 24px
- Card content (top to bottom):
  * Day name (e.g., "Monday") - 20px bold
  * Date (e.g., "Dec 15") - 14px light
  * Weather icon - 80px x 80px
  * High/Low temps with up/down arrows
  * Mini condition icons (rain chance, wind)
  * Rain probability percentage with blue droplet
- Hover effect: Card lifts up 8px with shadow enhancement
- Desktop: 5 cards in a row with gap of 20px
- Mobile: Horizontal scroll with snap points
- Active day: Highlighted with brighter background
- Transition animations: 0.3s ease-in-out
- Icons: Animated on hover
5. Detailed Hourly Forecast Prompt ⏰
text

Create an expandable hourly forecast section:
- Toggle button: "View Hourly Forecast" with chevron icon
- Expanded view: Horizontal timeline chart
- Chart design:
  * Graph background: rgba(255,255,255,0.05)
  * Temperature line: Curved bezier with gradient fill
  * Data points: Circular dots (12px) on the line
  * Hour labels: Bottom of chart (12AM, 3AM, 6AM, etc.)
  * Temperature labels: Above each data point
- Additional data rows below chart:
  * Weather icons for each hour
  * Rain probability bar chart
  * Wind speed indicators
- Colors:
  * Temperature line: Gradient from blue to red
  * Rain bars: Blue (#3B82F6)
  * Grid lines: rgba(255,255,255,0.1)
- Interactive: Hover over any hour shows tooltip with details
- Tooltip: Glass morphism card with full weather info
- Smooth accordion animation on expand/collapse
6. Weather Details Panel Prompt 📊
text

Design a comprehensive details sidebar/panel:
- Width: 350px on desktop, full width on mobile
- Background: Darker overlay (rgba(0,0,0,0.3))
- Sections in expandable accordions:

1. Air Quality Index
   - Large circular progress indicator
   - Color-coded (Green-Yellow-Orange-Red)
   - AQI number in center
   - Pollutant breakdown (PM2.5, PM10, O3)

2. Sun & Moon
   - Sunrise/Sunset times with sun arc visualization
   - Moonrise/Moonset times
   - Moon phase icon (animated)
   - Golden hour indicator

3. Precipitation
   - Rain/Snow probability graph
   - Radar map integration (optional)
   - Next hour precipitation forecast

4. Wind Information
   - Compass showing wind direction
   - Animated wind speed indicator
   - Gust speed warnings

5. Visibility & Clouds
   - Visibility distance with eye icon
   - Cloud coverage percentage
   - Cloud type illustration

- Each section: 16px padding, 12px gap between items
- Icons: 24px, consistent style (line or filled)
- Typography: Labels 14px gray, Values 18px white bold
7. Weather Alerts Banner Prompt ⚠️
text

Create an attention-grabbing alert system:
- Position: Top of screen, full width
- Height: Auto, min 80px
- Background gradient based on severity:
  * Extreme: Red (#DC2626) to dark red (#991B1B)
  * Severe: Orange (#EA580C) to dark orange
  * Moderate: Yellow (#EAB308) to amber
- Alert icon: Animated triangle with exclamation (40px)
- Layout: Icon + Alert title + Description + "Learn More" link
- Animation: Slide down from top with bounce
- Close button: X icon in top-right
- Pulse animation on icon for severe alerts
- Multiple alerts: Stacked or carousel
- Typography: Bold 20px title, 16px description
- Border bottom: 3px solid darker shade
- Box shadow: Large drop shadow for prominence
8. Location/City Card Prompt 📍
text

Design saved locations/favorites section:
- Grid layout: 3 columns on desktop, 1 on mobile
- Card size: 280px x 200px
- Card design:
  * Background: Weather-appropriate gradient (subtle)
  * Overlay: rgba(0,0,0,0.2) for text readability
  * Border radius: 12px
  * Image background: City landmark (optional)
- Card content:
  * City name + country (24px bold, top)
  * Current temperature (48px, center)
  * Weather icon (60px)
  * High/Low temps (16px, bottom)
  * Star icon for favorite (top-right corner)
- Hover effect: 
  * Card scales to 1.05
  * Shows "View Details" overlay
  * Brightness increases
- Add new location: "+" card with dashed border
- Max saved locations: 5-10
- Delete option: X icon appears on hover
- Click action: Loads that city's weather as main
9. Settings/Preferences Modal Prompt ⚙️
text

Create a settings overlay modal:
- Modal dimensions: 500px x 600px, centered
- Background: Dark semi-transparent overlay (rgba(0,0,0,0.7))
- Modal card: Glass morphism effect
- Close button: Top-right X with hover effect

Settings sections:
1. Units
   - Temperature: °C / °F toggle switch
   - Wind speed: km/h / mph / m/s
   - Pressure: hPa / inHg
   - Distance: km / miles

2. Appearance
   - Theme: Light / Dark / Auto toggle
   - Color scheme selector (5 preset gradients)
   - Background animation: On/Off toggle
   - Particle effects: On/Off

3. Notifications (if PWA)
   - Weather alerts: On/Off
   - Daily forecast: Time selector
   - Severe weather warnings: On/Off

4. Data & Privacy
   - Auto-detect location: On/Off
   - Save search history: On/Off
   - Clear cache button

- Each toggle: Modern iOS-style switch
- Color selectors: Circular color swatches
- Save button: Bottom, full-width, gradient background
- Smooth fade-in animation (0.3s)
- Settings persist in localStorage
10. Loading States & Animations Prompt ⏳
text

Design engaging loading experiences:

1. Initial Load Skeleton
   - Shimmer effect on placeholder cards
   - Pulsing circles where icons will appear
   - Animated gradient moving left to right
   - Duration: 1-2 seconds

2. Search Loading
   - Spinning weather icon (sun/cloud rotation)
   - "Fetching weather data..." text
   - Progress dots animation (...)
   - Semi-transparent overlay

3. Data Update Indicator
   - Small rotating icon in top-right
   - Subtle pulse on refresh button
   - Quick fade transition between old/new data

4. Error States
   - Sad cloud icon with animation
   - Error message: "City not found" or "Connection error"
   - "Try again" button with retry animation
   - Suggestions: "Did you mean...?" list

5. Empty State
   - Magnifying glass icon with search animation
   - "Search for a city to get started"
   - Trending cities as suggestions below

- All animations: CSS or Lottie files
- Timing: 300-500ms for micro-interactions
- Easing: cubic-bezier for smooth feel
11. Mobile-Specific Design Prompt 📱
text

Optimize for mobile experience:
- Bottom navigation bar (if multi-page):
  * Current weather icon
  * Forecast icon
  * Saved locations icon
  * Settings icon
  * Active state: Colored with label

- Pull-to-refresh gesture:
  * Drag down on main screen
  * Loading spinner appears
  * Haptic feedback (if supported)

- Swipe gestures:
  * Swipe left/right between saved cities
  * Swipe up for hourly forecast
  * Swipe down to close modals

- Touch-friendly targets:
  * Minimum 44px x 44px touch areas
  * Adequate spacing (12px minimum)
  * Large, clear icons

- Status bar integration:
  * Temperature in status bar (iOS)
  * Match status bar color to app theme

- Safe area handling:
  * Respect notch/island on iPhone
  * Bottom padding for gesture bar

- Orientation:
  * Portrait: Full vertical layout
  * Landscape: Side-by-side panels (optional)

- Performance:
  * Lazy load images
  * Reduce animations on low-end devices
  * Compress assets
12. Weather Icon Animation Prompts 🎭
Sunny
text

Animated sun icon:
- Central yellow circle (#F59E0B) with gradient to orange
- Rotating sun rays extending outward
- Subtle pulsing glow effect
- Ray animation: Rotate 360deg in 20s linear infinite
- Size: 120px, scalable
Cloudy
text

Layered clouds animation:
- 2-3 cloud layers moving at different speeds
- Light gray (#E5E7EB) to dark gray (#9CA3AF)
- Horizontal floating motion (translate-x)
- Subtle opacity changes
- Soft edges with blur
Rainy
text

Cloud with rain animation:
- Dark cloud at top
- Animated rain drops falling
- Drops: Blue streaks (#3B82F6) with motion blur
- Puddle ripples at bottom (optional)
- Random drop intervals for natural feel
Snowy
text

Cloud with snowflakes:
- White/light gray cloud
- Falling snowflakes (various sizes)
- Gentle swaying motion during fall
- Rotation animation on each flake
- Accumulation effect at bottom (optional)
Thunderstorm
text

Dark storm cloud:
- Very dark gray/purple cloud
- Lightning bolt flash animation
- Yellow/white lightning (#FCD34D)
- Random flash intervals (1-3s)
- Rain drops in background
- Thunder rumble effect (CSS shake)
Night Clear
text

Moon and stars:
- Crescent or full moon (based on phase)
- Twinkling stars background
- Soft blue/purple glow (#818CF8)
- Shooting star occasionally
- Gentle floating animation
Complete Color Scheme 🎨
Day Themes
CSS

/* Sunny Day */
--bg-sunny-start: #FF6B35;
--bg-sunny-end: #F7931E;
--text-sunny: #FFFFFF;
--card-sunny: rgba(255, 255, 255, 0.2);

/* Cloudy Day */
--bg-cloudy-start: #4A5568;
--bg-cloudy-end: #718096;
--text-cloudy: #FFFFFF;
--card-cloudy: rgba(255, 255, 255, 0.15);

/* Rainy Day */
--bg-rainy-start: #1E3A8A;
--bg-rainy-end: #3730A3;
--text-rainy: #FFFFFF;
--card-rainy: rgba(255, 255, 255, 0.1);

/* Snowy Day */
--bg-snowy-start: #93C5FD;
--bg-snowy-end: #DBEAFE;
--text-snowy: #1E293B;
--card-snowy: rgba(255, 255, 255, 0.3);

/* Night */
--bg-night-start: #0F172A;
--bg-night-end: #1E293B;
--text-night: #FFFFFF;
--card-night: rgba(255, 255, 255, 0.08);
UI Elements
CSS

--primary: #3B82F6;
--secondary: #8B5CF6;
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--text-primary: #FFFFFF;
--text-secondary: #CBD5E1;
--border: rgba(255, 255, 255, 0.2);
Typography System ✍️
CSS

/* Font Families */
--font-primary: 'Inter', -apple-system, sans-serif;
--font-secondary: 'Poppins', sans-serif;
--font-mono: 'Roboto Mono', monospace;

/* Font Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
--text-5xl: 48px;
--temperature-display: 96px;

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
Tech Stack Implementation 💻
Frontend Structure
JavaScript

// Recommended Tech Stack

1. Framework Options:
   - Vanilla JS (for simplicity)
   - React.js (for scalability)
   - Vue.js (alternative)

2. Styling:
   - Tailwind CSS (utility-first)
   - CSS Modules (scoped styles)
   - Styled Components (if React)

3. Animations:
   - Framer Motion (React)
   - GSAP (advanced animations)
   - Lottie (icon animations)
   - CSS animations (lightweight)

4. State Management:
   - Context API (React)
   - Zustand (lightweight)
   - LocalStorage for settings

5. API Calls:
   - Axios (feature-rich)
   - Fetch API (native)
   - SWR for caching (React)

6. Build Tools:
   - Vite (fast, modern)
   - Webpack (if needed)
   - Parcel (zero-config)

7. Additional Libraries:
   - Chart.js (for graphs)
   - Leaflet (for maps)
   - Day.js (date formatting)
   - Lodash (utilities)
API Integration Guide 🔌
OpenWeatherMap API Endpoints
JavaScript

// Current Weather
const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

// 5 Day Forecast
const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

// Geocoding (city search)
const geocodingURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`;

// Reverse Geocoding (coordinates to city)
const reverseGeoURL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

// Air Pollution
const airPollutionURL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

// One Call API (comprehensive data)
const oneCallURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`;
Data Structure Examples
JavaScript

// Sample Response Handler
const weatherData = {
  location: response.name,
  country: response.sys.country,
  temperature: Math.round(response.main.temp),
  feelsLike: Math.round(response.main.feels_like),
  humidity: response.main.humidity,
  pressure: response.main.pressure,
  windSpeed: response.wind.speed,
  windDirection: response.wind.deg,
  description: response.weather[0].description,
  icon: response.weather[0].icon,
  clouds: response.clouds.all,
  visibility: response.visibility / 1000, // km
  sunrise: new Date(response.sys.sunrise * 1000),
  sunset: new Date(response.sys.sunset * 1000),
};
File Structure 📁
text

weather-app/
│
├── public/
│   ├── icons/
│   │   ├── weather/           # Weather icons
│   │   └── ui/               # UI icons
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── CurrentWeather.jsx
│   │   ├── SearchBar.jsx
│   │   ├── ForecastCard.jsx
│   │   ├── HourlyForecast.jsx
│   │   ├── WeatherDetails.jsx
│   │   ├── SavedLocations.jsx
│   │   ├── SettingsModal.jsx
│   │   └── AlertBanner.jsx
│   │
│   ├── hooks/
│   │   ├── useWeatherData.js
│   │   ├── useGeolocation.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   ├── api.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── weatherIcons.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   ├── contexts/
│   │   ├── WeatherContext.js
│   │   └── SettingsContext.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env                       # API keys
├── package.json
├── vite.config.js
└── README.md
Key Features Implementation ✨
1. Geolocation
JavaScript

// Geolocation function
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to default city
        fetchWeatherByCity("London");
      }
    );
  }
};
2. Temperature Unit Toggle
JavaScript

// Unit conversion
const convertTemp = (celsius, unit) => {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9/5) + 32);
  }
  return Math.round(celsius);
};

// Toggle function
const toggleUnit = () => {
  setUnit(prevUnit => 
    prevUnit === 'celsius' ? 'fahrenheit' : 'celsius'
  );
};
3. Search with Autocomplete
JavaScript

// Debounced search
const handleSearch = debounce(async (query) => {
  if (query.length < 3) return;
  
  const suggestions = await fetchCitySuggestions(query);
  setSuggestions(suggestions);
}, 300);
4. Background Change Based on Weather
JavaScript

// Dynamic background
const getBackgroundGradient = (weatherCondition, isDay) => {
  if (!isDay) return 'linear-gradient(135deg, #0F172A, #1E293B)';
  
  const gradients = {
    'Clear': 'linear-gradient(135deg, #FF6B35, #F7931E)',
    'Clouds': 'linear-gradient(135deg, #4A5568, #718096)',
    'Rain': 'linear-gradient(135deg, #1E3A8A, #3730A3)',
    'Snow': 'linear-gradient(135deg, #93C5FD, #DBEAFE)',
    'Thunderstorm': 'linear-gradient(135deg, #1E1B4B, #312E81)',
  };
  
  return gradients[weatherCondition] || gradients['Clear'];
};
Advanced Features (Optional) 🚀
1. PWA Setup
JavaScript

// Service Worker for offline support
// Cache weather data for last searched cities
// Add to home screen functionality
// Background sync for updates
2. Weather Map Integration
JavaScript

// Leaflet.js integration
// Show precipitation layers
// Temperature overlay
// Interactive map with click to get weather
3. Historical Data
JavaScript

// Chart.js graphs
// Temperature trends
// Rainfall comparison
// Weather patterns
4. Voice Search
JavaScript

// Web Speech API
// "Hey Weather, show me London's forecast"
// Voice command for unit toggle
Performance Optimization ⚡
JavaScript

// Best Practices:
1. Lazy load forecast cards
2. Debounce search input
3. Cache API responses (5-10 minutes)
4. Compress and optimize images
5. Use CSS transforms for animations
6. Implement request throttling
7. Minimize re-renders (React.memo)
8. Use production builds
9. Enable Gzip compression
10. Optimize font loading
Accessibility Features ♿
text

1. Semantic HTML structure
2. ARIA labels for weather icons
3. Keyboard navigation support
4. Focus indicators on interactive elements
5. High contrast mode option
6. Screen reader friendly announcements
7. Skip to content link
8. Alt text for all images
9. Color blind friendly color schemes
10. Reduced motion option
Testing Checklist ✅
text

Functionality:
☐ Search returns correct weather data
☐ Geolocation works and falls back properly
☐ Unit toggle converts accurately
☐ 5-day forecast displays correctly
☐ Weather icons match conditions
☐ Hourly forecast shows accurate timeline
☐ Settings persist after page reload
☐ Saved locations work correctly
☐ Error handling for invalid cities
☐ API rate limiting handled gracefully

UI/UX:
☐ Responsive on all screen sizes
☐ Animations are smooth (60fps)
☐ Loading states are clear
☐ Empty states are helpful
☐ Touch targets are adequate (mobile)
☐ Background changes with weather
☐ Icons animate appropriately
☐ Modals can be closed easily
☐ Text is readable in all themes

Performance:
☐ Initial load under 3 seconds
☐ No layout shifts (CLS)
☐ Images optimized
☐ Minimal API calls
☐ Efficient state updates