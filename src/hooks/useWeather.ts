import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  city?: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWeather = async () => {
      try {
        // Tentar obter localização do usuário
        const position = await new Promise<GeolocationCoordinates>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos.coords),
              (err) => {
                // Se negar permissão, usar coordenadas padrão (São Paulo)
                console.warn('Localização negada, usando padrão');
                resolve({ latitude: -23.5505, longitude: -46.6333 } as GeolocationCoordinates);
              },
              { timeout: 5000 }
            );
          }
        );

        // Chamar API Open-Meteo
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${position.latitude}&longitude=${position.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`
        );

        if (!response.ok) throw new Error('Erro ao buscar clima');

        const data = await response.json();
        const current = data.current;

        setWeather({
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          city: data.timezone?.split('/')[1] || 'Local',
        });
      } catch (error) {
        console.error('Erro ao obter clima:', error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  const getWeatherDescription = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0 || code === 1) return '☀️ Ensolarado';
    if (code === 2) return '⛅ Parcialmente nublado';
    if (code === 3) return '☁️ Nublado';
    if (code === 45 || code === 48) return '🌫️ Nevoeiro';
    if (code >= 50 && code <= 67) return '🌧️ Chuva';
    if (code >= 71 && code <= 85) return '❄️ Neve';
    if (code >= 80 && code <= 82) return '🌧️ Chuva forte';
    if (code >= 85 && code <= 86) return '❄️ Neve forte';
    if (code >= 80 && code <= 99) return '⚡ Tempestade';
    return '🌤️ Desconhecido';
  };

  return {
    weather,
    loading,
    getWeatherDescription,
  };
}
