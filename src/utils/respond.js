const { InteractionResponseType, InteractionResponseFlags } = require("discord-interactions");

function reply(content, ephemeralFlag = false) {
  const data = typeof content === "string" ? { content } : content;
  if (ephemeralFlag) data.flags = InteractionResponseFlags.EPHEMERAL;
  return { type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data };
}

function ephemeral(content) {
  return reply(content, true);
}

function deferReply(ephemeralFlag = false) {
  const data = {};
  if (ephemeralFlag) data.flags = InteractionResponseFlags.EPHEMERAL;
  return { type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data };
}

function updateMsg(content) {
  const data = typeof content === "string" ? { content } : content;
  return { type: InteractionResponseType.UPDATE_MESSAGE, data };
}

function embed({ title, description, color = 0x2b2d31, fields, footer, thumbnail }) {
  const e = { title, description, color };
  if (fields) e.fields = fields;
  if (footer) e.footer = { text: footer };
  if (thumbnail) e.thumbnail = { url: thumbnail };
  return e;
}

module.exports = { reply, ephemeral, deferReply, updateMsg, embed };
