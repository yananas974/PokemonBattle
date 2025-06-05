import { Hono } from "hono";

const meteoController = new Hono();

const YOUR_API_KEY = 'd99181dd81d4303917c0131dfa5c920c';

const fetchMeteo = async () => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${YOUR_API_KEY}`);
  const data = await response.json();
  return data;
};


meteoController.get('/', async (c) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${YOUR_API_KEY}`);
  const data = await response.json();
  return c.json(data);
});

export default meteoController;