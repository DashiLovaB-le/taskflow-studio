import { useWeather } from '@/hooks/useWeather';

export function WeatherWidget() {
  const { weather, loading, getWeatherDescription } = useWeather();

  if (loading || !weather) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
      <div className="flex flex-col items-end">
        <p className="text-sm font-medium text-foreground">
          {weather.temperature}°C
        </p>
        <p className="text-xs text-muted-foreground">
          {getWeatherDescription(weather.weatherCode)}
        </p>
      </div>
    </div>
  );
}
