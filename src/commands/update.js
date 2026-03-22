const { reply, ephemeral, embed } = require("../utils/respond");

const DEV_ID = "282997545620209665";

async function updateCmd(opts, member) {
  if (member.user.id !== DEV_ID) {
    return ephemeral({ content: "only the developer can use this." });
  }

  const features = opts.features;
  const note = opts.note || null;
  const channelId = process.env.UPDATE_CHANNEL_ID;
  const roleId = process.env.UPDATE_ROLE_ID;

  if (!channelId) return ephemeral({ content: "UPDATE_CHANNEL_ID not set in env." });

  const lines = features.split(",").map(f => `* ${f.trim()}`).join("\n");
  let msg = `<@&${roleId}>\n${lines}`;
  if (note) msg += `\n\n* ${note}`;

  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: JSON.stringify({
      content: msg,
      allowed_mentions: { roles: [roleId] }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return ephemeral({ content: `failed to post update: ${err}` });
  }

  return ephemeral({
    embeds: [embed({
      title: "✅ Update Posted",
      description: `sent to <#${channelId}>`,
      color: 0x57f287
    })]
  });
}

module.exports = { updateCmd };
