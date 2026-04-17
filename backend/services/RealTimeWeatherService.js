const axios = require('axios');

/**
 * RealTimeWeatherService
 * Integrates with Open-Meteo API for live weather data
 */
class RealTimeWeatherService {
  constructor(io) {
    this.io = io;
    this.cache = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
  }

  /**
   * Fetch real-time weather data for a location
   */
  async getWeatherData(lat, lon) {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[WeatherService] Using cached weather data');
      return cached.data;
    }

    try {
      console.log(`[WeatherService] Fetching weather data for ${lat}, ${lon}`);
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,weather_code,visibility',
          hourly: 'temperature_2m,precipitation_probability,precipitation',
          timezone: 'Asia/Kolkata',
          forecast_days: 1
        },
        timeout: 10000
      });

      if (!response.data || !response.data.current) {
        throw new Error('Invalid weather response from API');
      }

      const data = response.data;
      const weatherData = {
        temperature: data.current.temperature_2m,
        precipitation: data.current.precipitation,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        visibility: data.current.visibility / 1000, // Convert to km
        hourlyForecast: data.hourly,
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo API'
      };

      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      console.log('[WeatherService] ✅ Weather data fetched successfully');
      return weatherData;
    } catch (error) {
      console.error('[WeatherService] ❌ Weather API Error:', error.message);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * Get AQI data from multiple sources
   */
  async getAQIData(lat, lon) {
    try {
      console.log(`[WeatherService] Fetching AQI data for ${lat}, ${lon}`);
      // Using Open-Meteo Air Quality API
      const response = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi',
          timezone: 'Asia/Kolkata'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.current) {
        throw new Error('Invalid AQI response from API');
      }

      const data = response.data.current;
      const aqiData = {
        aqi: data.us_aqi || 0,
        pm25: data.pm2_5,
        pm10: data.pm10,
        co: data.carbon_monoxide,
        no2: data.nitrogen_dioxide,
        so2: data.sulphur_dioxide,
        o3: data.ozone,
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo AQI'
      };
      
      console.log('[WeatherService] ✅ AQI data fetched successfully');
      return aqiData;
    } catch (error) {
      console.error('[WeatherService] ❌ AQI API Error:', error.message);
      throw new Error(`Failed to fetch AQI data: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to city name
   */
  async reverseGeocode(lat, lon) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'EarnSure-Insurance-Platform/1.0'
        }
      });

      const address = response.data.address;
      return {
        city: address.city || address.town || address.state_district || address.state,
        state: address.state,
        country: address.country,
        displayName: response.data.display_name
      };
    } catch (error) {
      console.error('Geocoding Error:', error.message);
      return null;
    }
  }

  /**
   * Start real-time monitoring for a worker
   */
  startMonitoring(workerId, lat, lon) {
    const intervalId = setInterval(async () => {
      const weather = await this.getWeatherData(lat, lon);
      const aqi = await this.getAQIData(lat, lon);

      if (weather && this.io) {
        this.io.to(workerId.toString()).emit('weather_update', {
          ...weather,
          aqi: aqi.aqi,
          aqiDetails: aqi
        });

        // Check for trigger conditions
        this.checkTriggers(workerId, weather, aqi);
      }
    }, 30000); // Update every 30 seconds

    return intervalId;
  }

  /**
   * Check if weather conditions meet trigger thresholds
   */
  checkTriggers(workerId, weather, aqi) {
    const triggers = [];

    if (aqi.aqi >= 300) {
      triggers.push({
        type: 'AQI_CRITICAL',
        value: aqi.aqi,
        severity: 'SEVERE',
        message: `Critical AQI level: ${aqi.aqi}`
      });
    }

    if (weather.precipitation >= 50) {
      triggers.push({
        type: 'HEAVY_RAIN',
        value: weather.precipitation,
        severity: 'HIGH',
        message: `Heavy rainfall: ${weather.precipitation}mm`
      });
    }

    if (weather.temperature >= 42) {
      triggers.push({
        type: 'EXTREME_HEAT',
        value: weather.temperature,
        severity: 'HIGH',
        message: `Extreme heat: ${weather.temperature}°C`
      });
    }

    if (triggers.length > 0 && this.io) {
      this.io.to(workerId.toString()).emit('trigger_alert', triggers);
    }
  }

  /**
   * Get weather forecast for next 24 hours
   */
  async getForecast(lat, lon) {
    try {
      console.log(`[WeatherService] Fetching forecast for ${lat}, ${lon}`);
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code',
          timezone: 'Asia/Kolkata',
          forecast_days: 1
        },
        timeout: 10000
      });

      if (!response.data || !response.data.hourly) {
        throw new Error('Invalid forecast response from API');
      }

      console.log('[WeatherService] ✅ Forecast fetched successfully');
      return {
        hourly: response.data.hourly,
        timezone: response.data.timezone
      };
    } catch (error) {
      console.error('[WeatherService] ❌ Forecast Error:', error.message);
      throw new Error(`Failed to fetch forecast: ${error.message}`);
    }
  }
}

module.exports = RealTimeWeatherService;
