const express = require("express");
const dotenv = require("dotenv");
const { attachWebhookRoutes } = require("./webhook");
const mongoose = require("mongoose");

dotenv.config();

const PORT = process.env.BOT_PORT || 3301; // Separate port for bot service

const app = express();

// Middleware to parse JSON
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Bot connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Attach webhook routes
attachWebhookRoutes(app);

// Start the bot server
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
