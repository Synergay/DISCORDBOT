const { reply, ephemeral, embed } = require("../utils/respond");
const features = require("./features");
const credits = require("./credits");
const { priceCmd } = require("./priceinfo");
const { executorsCmd } = require("./executors");

async function setupCmd(opts, token) {
  const channel = opts.channel;
  const fn = opts.function;

  let payload;
  if (fn === "features") {
    payload = features.featuresCmd();
  } else if (fn === "credits") {
    payload = credits.creditsCmd();
  } else if (fn === "priceinfo") {
    payload = priceCmd();
  } else if (fn === "executors") {
    payload = executorsCmd();
  } else {
    return ephemeral({ content: `Unknown function: \`${fn}\`` });
  }

  const url = `https://discord.com/api/v10/channels/${channel}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: JSON.stringify(payload.data)
  });

  if (!res.ok) {
    const err = await res.text();
    return ephemeral({ content: `Failed to send: ${err}` });
  }

  return ephemeral({
    embeds: [embed({
      title: "✅ Setup Complete",
      description: `Sent **${fn}** panel to <#${channel}>`,
      color: 0x57f287
    })]
  });
}

module.exports = { setupCmd };
