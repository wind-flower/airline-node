const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios'); // For making web service requests
const NodeCache = require('node-cache'); // In-memory cache
const winston = require('winston'); // Logging library
const app = express();
const PORT = process.env.PORT || 3000;

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Cache setup with 10 minutes TTL
const cache = new NodeCache({ stdTTL: 600 });

let flightData = [];

// Async function to load flight data and ensure distinct records
async function loadFlightData() {
  try {
    const data = [];
    const uniqueKeys = new Set();

    const stream = fs.createReadStream('flights.csv').pipe(csv());

    for await (const row of stream) {
      const uniqueKey = `${row.flight_num}-${row.origin_name}-${row.destination_name}`;
      if (!uniqueKeys.has(uniqueKey)) {
        uniqueKeys.add(uniqueKey);
        data.push(row);
      }
    }

    flightData = data;
    logger.info('CSV file successfully processed and loaded without duplicates.');
  } catch (error) {
    logger.error(`Error loading flight data: ${error.message}`);
  }
}

// Load flight data initially
loadFlightData();

// Endpoint: Get all flights (with cache and error handling)
app.get('/flights', async (req, res) => {
  try {
    res.json(flightData);
    logger.info('Fetched all flights');
  } catch (error) {
    logger.error(`Error fetching flights: ${error.message}`);
    res.status(500).json({ message: 'Error fetching flight data' });
  }
});

// Endpoint: Get flight by flight_num (with cache)
app.get('/flights/flight/:flight_num', (req, res) => {
  const { flight_num } = req.params;

  // Check cache first
  const cachedFlight = cache.get(`flight_${flight_num}`);
  if (cachedFlight) {
    logger.info(`Cache hit for flight ${flight_num}`);
    return res.json(cachedFlight);
  }

  const flight = flightData.find(item => item.flight_num === flight_num);
  if (flight) {
    // Cache the flight data
    cache.set(`flight_${flight_num}`, flight);
    logger.info(`Cache miss, flight ${flight_num} fetched and cached.`);
    res.json(flight);
  } else {
    logger.warn(`Flight ${flight_num} not found.`);
    res.status(404).json({ message: 'Flight not found' });
  }
});

// Endpoint: Get flight by origin_name and/or destination_name (case-insensitive search)
app.get('/flights/search', async (req, res) => {
  const { origin, destination } = req.query;

  try {
    let results = flightData;

    // Case-insensitive search
    if (origin) {
      results = results.filter(item => 
        item.origin.toLowerCase() === origin.toLowerCase()
      );
    }

    if (destination) {
      results = results.filter(item => 
        item.destination.toLowerCase() === destination.toLowerCase()
      );
    }

    if (results.length > 0) {
      logger.info(`Search results found for origin: ${origin}, destination: ${destination}`);
      res.json(results);
    } else {
      logger.warn(`No flights found for origin: ${origin}, destination: ${destination}`);
      res.status(404).json({ message: 'Flight not found' });
    }
  } catch (error) {
    logger.error(`Error processing flight search: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Error handling middleware for unknown routes
app.use((req, res) => {
  logger.warn(`Endpoint not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
