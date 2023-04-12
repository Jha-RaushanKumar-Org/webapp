var express = require("express");

const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());
const db = require("./config/sequalize");
const routes = require('./routes/route');
const logger = require('./logging');
const SDC = require("statsd-client");
const metricCounter = new SDC({
  host: "localhost",
  port: 8125
});

app.get("/healthz", (req, res) => {
  logger.info('Get Health API Call');
  metricCounter.increment('Get/healthz');
  res.status(200).json();
});
app.get("/gethealthz", (req, res) => {
  res.status(200).json();
});

routes(app);

// Handle undefined routes
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

module.exports = app;