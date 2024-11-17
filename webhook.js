const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
const User = require("./models/user_model"); // Adjust path if models are shared

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/webhook`;

const bot = new Telegraf(BOT_TOKEN);

// Define bot commands
bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString();

  try {
    const user = await User.findOne({ chatId });

    if (user) {
      const fullname = user.fullName || "User";
      await ctx.reply(
        `Welcome back ${fullname}! Open the web app and log in:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Login",
                  web_app: { url: "https://thewhiteshark.io/" },
                },
              ],
            ],
          },
        }
      );
    } else {
      await ctx.reply("Welcome! Please sign up using our web app:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "SignUp",
                web_app: { url: "https://thewhiteshark.io/authenticate" },
              },
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error checking user in the database:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

// Webhook setup
const setWebhook = async () => {
  try {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log(`Webhook set to ${WEBHOOK_URL}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

// Attach webhook route to Express
const attachWebhookRoutes = (app) => {
  app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error("Error processing update:", err);
        res.sendStatus(500);
      });
  });

  if (process.env.NODE_ENV === "production") {
    setWebhook();
  } else {
    bot.launch();
    console.log("Bot is running in development mode using polling...");
  }
};

module.exports = { attachWebhookRoutes };
