const { ephemeral } = require("../utils/respond");

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

async function copyCmd(opts, member) {
  const msgId = opts.message_id;
  const source = opts.source || opts._channel_id;
  const target = opts.target || opts._channel_id;

  try {
    const fetchRes = await fetch(`${API}/channels/${source}/messages/${msgId}`, { headers: headers() });
    if (!fetchRes.ok) return ephemeral({ content: "couldn't fetch that message." });

    const msg = await fetchRes.json();

    const payload = {};
    if (msg.content) payload.content = msg.content;
    if (msg.embeds?.length) payload.embeds = msg.embeds;
    if (msg.components?.length) payload.components = msg.components;

    const sendRes = await fetch(`${API}/channels/${target}/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      return ephemeral({ content: `failed to send: ${err}` });
    }

    return ephemeral({ content: `copied to <#${target}>` });
  } catch (err) {
    return ephemeral({ content: `error: ${err.message}` });
  }
}

module.exports = { copyCmd };
