// Import dependencie
const express = require("express");

// Setup the express server
const app = express();
const port = process.env.API_PORT;

// Import routes
const eticaRouter = require("./routes/etica.js");

// Setup the routes
app.use("/api/etica", eticaRouter);

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});