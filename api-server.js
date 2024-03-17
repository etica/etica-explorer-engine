// Import dependencie
const express = require("express");

const dotenv = require('dotenv');
dotenv.config();

// Setup the express server
const app = express();
const port = process.env.API_PORT;

// Import routes
const blockchainRouter = require("./routes/blockchain.js"); // queries on blockchain node
const eticaRouter = require("./routes/etica.js"); // queries on local db

// Setup the routes
app.use("/api/blockchain", blockchainRouter);
app.use("/api/etica", eticaRouter);

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});