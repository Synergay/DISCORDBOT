const { InteractionType, InteractionResponseType } = require("discord-interactions");
const { verify } = require("../src/utils/verify");
const { handleCmd } = require("../src/handlers/commands");
const { handleComponent } = require("../src/handlers/components");
const { handleModalSubmit } = require("../src/commands/editfeatures");
const { storePanel } = require("../src/commands/execlist");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("method not allowed");

  const sig = req.headers["x-signature-ed25519"];
  const ts = req.headers["x-signature-timestamp"];

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString();

  if (!sig || !ts || !verify(rawBody, sig, ts, process.env.DISCORD_PUBLIC_KEY)) {
    return res.status(401).send("invalid signature");
  }

  const body = JSON.parse(rawBody);

  if (body.type === InteractionType.PING) {
    return res.json({ type: InteractionResponseType.PONG });
  }

  if (body.type === InteractionType.APPLICATION_COMMAND) {
    const channelId = body.channel_id || body.channel?.id;
    const result = await handleCmd(body.data, body.member || { user: body.user }, body.token, channelId);
    res.json(result);

    // capture panel message ID for /executors
    if (body.data.name === "executors" && channelId) {
      try {
        const appId = process.env.DISCORD_APP_ID;
        const token = body.token;
        const msgRes = await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`);
        if (msgRes.ok) {
          const msg = await msgRes.json();
          await storePanel(channelId, msg.id);
        }
      } catch {}
    }
    return;
  }

  if (body.type === InteractionType.MESSAGE_COMPONENT) {
    const result = await handleComponent(body.data);
    return res.json(result);
  }

  if (body.type === 5) {
    const result = await handleModalSubmit(body.data);
    if (result) return res.json(result);
  }

  return res.status(400).send("unknown interaction type");
};
