import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
const app = express();

const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (
            allowedOrigins.includes(origin) ||
            !process.env.NODE_ENV ||
            process.env.NODE_ENV === 'development' ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json()); 


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable Mongoose buffering to fail fast if not connected
        };
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/weather_app';

        cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
            console.log('✅ New MongoDB Connection Established');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB Connection Error:', e);
        throw e;
    }

    return cached.conn;
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const PORT = 5000;



// Unified endpoint to get Weather (Current + Forecast) and AQI from OpenWeatherMap
app.get('/api/report', async (req, res) => {
    try {
        const { city, lat: qLat, lon: qLon } = req.query;

        // Security: Input Validation
        if (city && city.length > 50) {
            return res.status(400).json({ error: 'City name too long' });
        }
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            throw new Error('OPENWEATHER_API_KEY is missing');
        }

        let weatherParams = { appid: apiKey, units: 'metric' };
        if (city) {
            weatherParams.q = city;
        } else if (qLat && qLon) {
            weatherParams.lat = qLat;
            weatherParams.lon = qLon;
        } else {
            return res.status(400).json({ error: 'City or coordinates are required' });
        }

        // 1. Get Current Weather (for coordinates and current state)
        const weatherReq = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: weatherParams
        });

        const weatherData = weatherReq.data;
        const { lat, lon } = weatherData.coord;

        // 2. Get 5-Day Forecast (3-hour steps)
        const forecastReq = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: { lat, lon, appid: apiKey, units: 'metric' }
        });

        const forecastData = forecastReq.data;

        // 3. Get AQI Data
        let aqiData = null;
        try {
            const aqiReq = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
                params: { lat, lon, appid: apiKey }
            });
            aqiData = aqiReq.data.list[0].main.aqi;
        } catch (aqiError) {
            console.error('AQI Fetch Error:', aqiError.message);
            aqiData = 'N/A';
        }

        // Cache for 15 minutes (900s) at the Edge (CDN)
        // stale-while-revalidate=59 allows serving slightly old data while fetching new data in background
        res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=59');

        res.json({
            weather: weatherData,
            forecast: forecastData,
            aqi: aqiData,
            mapToken: apiKey
        });

    } catch (error) {
        console.error('Data Fetch Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Export for Vercel
export default app;

// Only run server directly if not in production (Vercel handles this automatically)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}
