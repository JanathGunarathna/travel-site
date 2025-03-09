import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Droplets, Wind, MapPin, Search, ArrowRight } from "lucide-react";

const api = {
  key: "d836626653414be18c946b9872e6901d",
  base: "https://api.openweathermap.org/data/2.5/",
};

function WeatherDashboard() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState({});
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const searchPressed = async () => {
    if (!search) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const weatherResponse = await fetch(
        `${api.base}weather?q=${search}&units=metric&APPID=${api.key}`
      );
      const weatherData = await weatherResponse.json();
      
      if (weatherData.cod === "404") {
        throw new Error("City not found");
      }
      
      setWeather(weatherData);
      
      // Get forecast data for next 24 hours
      const forecastResponse = await fetch(
        `${api.base}forecast?q=${search}&units=metric&APPID=${api.key}`
      );
      const forecastData = await forecastResponse.json();
      
      // Extract next 8 forecast points (24 hours, 3-hour intervals)
      const next24Hours = forecastData.list.slice(0, 8);
      setForecast(next24Hours);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPlaces = () => {
    if (weather.name) {
      navigate(`/places/${weather.name}`, { state: { coords: weather.coord } });
    }
  };

  // Helper for time formatting
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to determine weather icon based on condition
  const getWeatherIcon = (condition) => {
    if (condition.includes("rain") || condition.includes("drizzle")) {
      return <Droplets className="detail-icon" />;
    } else if (condition.includes("cloud")) {
      return <Cloud className="detail-icon" />;
    } else if (condition.includes("wind")) {
      return <Wind className="detail-icon" />;
    } else {
      return <div className="sun-icon"></div>; // Sun
    }
  };

  return (
    <div className="min-height-screen gradient-background">
      <div className="container padding-y">
        {/* Header */}
        <div className="text-center margin-bottom">
        <h1 style={{ color: 'yellow' }}>Weather Dashboard</h1>
          <p className="subtitle">Check weather conditions anywhere</p>
        </div>

        {/* Search Box */}
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Enter a city name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchPressed()}
            />
            <button 
              onClick={searchPressed}
              className="search-button"
            >
              <Search className="button-icon" />
              Search
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading weather data...</p>
          </div>
        ) : (
          weather.main && (
            <div className="margin-bottom">
              {/* Current Weather Card */}
              <div className="card">
                <div className="card-body">
                  <div className="weather-header">
                    <div>
                      <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
                      <p className="coordinates">
                        <MapPin className="coordinate-icon" />
                        {weather.coord.lat.toFixed(2)}°N, {weather.coord.lon.toFixed(2)}°E
                      </p>
                    </div>
                    <div>
                      <div className="temperature">{Math.round(weather.main.temp)}°C</div>
                      <p className="weather-description">{weather.weather[0].description}</p>
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div className="weather-details">
                    <div className="weather-detail-item">
                      <div className="detail-header">
                        <Droplets className="detail-icon" />
                        <h3 className="detail-title">Humidity</h3>
                      </div>
                      <p className="detail-value">{weather.main.humidity}%</p>
                    </div>
                    
                    <div className="weather-detail-item">
                      <div className="detail-header">
                        <Wind className="detail-icon" />
                        <h3 className="detail-title">Wind Speed</h3>
                      </div>
                      <p className="detail-value">{weather.wind.speed} m/s</p>
                    </div>
                    
                    <div className="weather-detail-item">
                      <div className="detail-header">
                        <Cloud className="detail-icon" />
                        <h3 className="detail-title">Temperature</h3>
                      </div>
                      <p className="detail-value">{Math.round(weather.main.feels_like)}°C</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={viewPlaces}
                    className="view-places-button"
                  >
                    View Places in {weather.name} <ArrowRight className="button-arrow" />
                  </button>
                </div>
              </div>

              {/* 24 Hour Forecast */}
              {forecast.length > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h3>24 Hour Forecast</h3>
                    <div className="forecast-container">
                      <div className="forecast-items">
                        {forecast.map((item, index) => (
                          <div key={index} className="forecast-item">
                            <p className="forecast-time">{formatTime(item.dt)}</p>
                            <div className="forecast-icon-container">
                              {getWeatherIcon(item.weather[0].main.toLowerCase())}
                            </div>
                            <p className="forecast-temp">{Math.round(item.main.temp)}°C</p>
                            <p className="forecast-rain">
                              {item.rain ? `${(item.rain["3h"] || 0).toFixed(1)} mm` : "No rain"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {!loading && !weather.main && !error && (
          <div className="text-center padding-y">
            <div className="empty-state">
              <Cloud className="empty-icon" />
              <h3 className="empty-title">No Weather Data Available</h3>
              <p className="empty-text">Search for a city to view current weather conditions and forecast.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherDashboard;