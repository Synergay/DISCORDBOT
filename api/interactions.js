const { InteractionType, InteractionResponseType } = require("discord-interactions");
const { verify } = require("../src/utils/verify");
const { handleCmd } = require("../src/handlers/commands");
const { handleComponent } = require("../src/handlers/components");
const { handleModalSubmit } = require("../src/commands/editfeatures");
const { handleEditModal } = require("../src/commands/execlist");
const { handleAddModal, handleEditModal: handleScriptEditModal } = require("../src/commands/scripts");
const { handleAuthModal, handleDeauthAllModal } = require("../src/commands/authorization");
const { handleThresholdModal } = require("../src/commands/ticket");
const { runBackfill } = require("../src/commands/backfill");

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
    const guildId = body.guild_id;
    const member = body.member || { user: body.user };
    const result = await handleCmd(body.data, member, body.token, channelId, guildId);
    res.json(result);

    // ── Deferred backfill async processing ──
    if (body.data.name === "backfill") {
      const opts = {};
      if (body.data.options) {
        for (const o of body.data.options) {
          opts[o.name] = o.value;
        }
      }
      opts._channel_id = channelId;
      const appId = process.env.DISCORD_APP_ID;
      try {
        await runBackfill(opts, guildId, appId, body.token);
      } catch (err) {
        // Try to report the error via follow-up
        try {
          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${body.token}/messages/@original`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
            body: JSON.stringify({ content: `❌ Backfill failed: ${err.message}` }),
          });
        } catch {}
      }
    }

    return;
  }

  if (body.type === InteractionType.MESSAGE_COMPONENT) {
    const data = body.data;
    // Attach member info for auth checks in component handlers
    data.member = body.member || { user: body.user, roles: [] };
    const result = await handleComponent(data);
    return res.json(result);
  }

  if (body.type === 5) { // MODAL_SUBMIT
    const modalId = body.data.custom_id;
    let result = null;

    // Auth modals (single type or ALL)
    if (modalId.startsWith("modal_auth_add_")) {
      result = await handleAuthModal(body.data);
    }
    // Deauth ALL modal
    else if (modalId === "modal_auth_remove_ALL") {
      result = await handleDeauthAllModal(body.data);
    }
    // Executor edit modals
    else if (modalId.startsWith("modal_exec_edit_")) {
      result = await handleEditModal(body.data);
    }
    // Script add modal
    else if (modalId === "modal_script_add") {
      result = await handleAddModal(body.data);
    }
    // Script edit modals
    else if (modalId.startsWith("modal_script_edit_")) {
      result = await handleScriptEditModal(body.data);
    }
    // Ticket threshold modal
    else if (modalId === "modal_ticket_threshold") {
      result = await handleThresholdModal(body.data);
    }
    // Feature edit modals (keyless, premium, prices)
    else {
      result = await handleModalSubmit(body.data);
    }

    if (result) return res.json(result);
  }

  return res.status(400).send("unknown interaction type");
};
