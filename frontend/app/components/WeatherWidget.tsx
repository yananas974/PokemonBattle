import { useState, useEffect } from 'react';

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

export default function WeatherWidget() {
  return <div>WeatherWidget OK</div>;
} 