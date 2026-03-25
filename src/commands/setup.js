const { reply, ephemeral, embed } = require("../utils/respond");
const features = require("./features");
const credits = require("./credits");
const { priceCmd } = require("./priceinfo");
const { executorsCmd } = require("./executors");
const store = require("../utils/store");

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

async function setupCmd(opts, token) {
  const channel = opts.channel;
  const fn = opts.function;

  let payload;
  if (fn === "features") payload = features.featuresCmd();
  else if (fn === "credits") payload = credits.creditsCmd();
  else if (fn === "priceinfo") payload = await priceCmd();
  else if (fn === "executors") payload = await executorsCmd();
  else return ephemeral({ content: `unknown function: \`${fn}\`` });

  const res = await fetch(`${API}/channels/${channel}/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload.data),
  });

  if (!res.ok) {
    const err = await res.text();
    return ephemeral({ content: `failed to send: ${err}` });
  }

  const msg = await res.json();
  await store.set(`panel:${fn}`, JSON.stringify({ channelId: channel, messageId: msg.id }));

  return ephemeral({
    embeds: [embed({
      title: "\u2705 Setup Complete",
      description: `Sent **${fn}** panel to <#${channel}>\nMessage ID: \`${msg.id}\` (stored for live editing)`,
      color: 0x57f287,
    })]
  });
}

module.exports = { setupCmd };
