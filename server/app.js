const express = require("express");
const path = require("path");

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/getWeather", async (req, res) => {
	console.clear();
	try {
		console.log("Input: ", req.body);
		const cities = req.body.cities;
		if (!cities || !Array.isArray(cities) || cities.length === 0) {
			return res.status(400).json({
				error: "Invalid input. Please provide an array of cities.",
			});
		}

		const weatherPromises = cities.map(async (city) => {
			const weather = await getWeatherForCity(city);
			return { [city]: weather };
		});

		const weatherResults = await Promise.all(weatherPromises);

		const weatherObject = Object.assign({}, ...weatherResults);

		res.json({ weather: weatherObject });
		console.log("Output: ", { weather: weatherObject });
	} catch (error) {
		console.error("Error fetching weather:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

async function getWeatherForCity(city) {
	const API_URL = "http://api.weatherapi.com/v1/current.json";
	const API_KEY = "a0d20c0ca6614aca99195830240202";

	try {
		const response = await fetch(API_URL + `?q=${city}&key=${API_KEY}`);
		const weatherData = await response.json();

		// console.log(`\n\nWeather API response for ${city}:\n`, weatherData);
		return weatherData.current.temp_c + "°C";
	} catch (error) {
		console.error(`Error fetching weather for ${city}:`, error.message);
		return "N/A";
	}
}

app.listen(app.get("port"), () =>
	console.log(`Server is running on port ${app.get("port")}`)
);
