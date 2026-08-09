import React, { useState, useEffect } from 'react';

// 1. Comprehensive Asset Mapping (Combining clear, storms, snow, cold, cloudy, and rain)
const weatherBackgrounds = {
  clear: '/skyline-day.jpg',
  sunny: '/skyline-day.jpg',
  'partly cloudy': '/skyline-day.jpg',
  thunderstorm: '/lightning-dark.jpg',
  'severe thunderstorm': '/lightning-orange.jpg',
  tornado: '/lightning-orange.jpg',
  'snow storm': '/snowstorm.jpg',
  snow: '/snowstorm.jpg',
  cold: '/cold-winter.jpg',
  cloudy: '/cloudy.jpg',
  overcast: '/cloudy.jpg',
  rain: '/rainy.jpg',
  rainy: '/rainy.jpg',
  default: '/skyline-day.jpg'
};

export default function WeatherBackgroundWrapper({ weatherCondition, temperature, children }) {
  // 2. State Management for Background URL
  const [backgroundUrl, setBackgroundUrl] = useState(weatherBackgrounds.default);

  // 3. Update Logic triggered by weather condition or temperature changes
  useEffect(() => {
    if (!weatherCondition) return;
    
    const condition = weatherCondition.toLowerCase();
    let matchedImage = weatherBackgrounds.default;

    // Check conditions hierarchically
    if (condition.includes('snow') || condition.includes('blizzard')) {
      matchedImage = weatherBackgrounds['snow storm'];
    } else if (temperature !== undefined && temperature < 32) {
      // Low-temperature threshold for cold winter days
      matchedImage = weatherBackgrounds.cold;
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      matchedImage = condition.includes('severe') ? weatherBackgrounds['severe thunderstorm'] : weatherBackgrounds.thunderstorm;
    } else if (condition.includes('tornado')) {
      matchedImage = weatherBackgrounds.tornado;
    } else if (condition.includes('rain') || condition.includes('shower')|| condition.includes('drizzle')) {
      matchedImage = weatherBackgrounds.rain;
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      matchedImage = weatherBackgrounds.cloudy;
    } else if (condition.includes('clear') || condition.includes('sun')) {
      matchedImage = weatherBackgrounds.sunny;
    }

    setBackgroundUrl(matchedImage);
  }, [weatherCondition, temperature]);

  // 4. CSS Application with viewport coverage and smooth transitions
  const containerStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%',
    transition: 'background-image 0.5s ease-in-out',
  };

  return (
    <div className="weather-bg" style={containerStyle}>
      <div style={{ padding: 12 }}>{/* provide some outer padding so frosted container sits away from edges */}
        <div className="frosted" style={{ padding: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
