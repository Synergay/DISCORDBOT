const { processTicketChannels } = require("../src/commands/ticket");

module.exports = async function handler(req, res) {
  // Verify cron secret to prevent unauthorized access
  const secret = req.query?.key || req.headers["x-cron-secret"];
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const result = await processTicketChannels();
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
