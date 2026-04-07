const { ephemeral, embed } = require("../utils/respond");

const DEV_ID = "282997545620209665";
const OWNER_ID = "1051444466235486298";

async function publishUpdateCmd(opts, member) {
  const userId = member.user?.id || member.id;
  if (userId !== DEV_ID && userId !== OWNER_ID) {
    return ephemeral({ content: "only the developer can use this." });
  }

  const features = opts.features;
  const note = opts.note || null;
  const channelId = process.env.UPDATE_CHANNEL_ID;
  const roleId = process.env.UPDATE_ROLE_ID;

  if (!channelId) return ephemeral({ content: "UPDATE_CHANNEL_ID not set in env." });

  const lines = features.split(",").map(f => `- ${f.trim()}`).join("\n");

  const updateEmbed = {
    title: "📢 Update",
    description: lines,
    color: 0x5865f2,
    timestamp: new Date().toISOString()
  };

  if (note) {
    updateEmbed.fields = [{ name: "📝 Note", value: note }];
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: JSON.stringify({
      content: roleId ? `<@&${roleId}>` : "",
      embeds: [updateEmbed],
      allowed_mentions: { roles: roleId ? [roleId] : [] }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return ephemeral({ content: `failed to post update: ${err}` });
  }

  return ephemeral({
    embeds: [embed({
      title: "\u2705 Update Posted",
      description: `sent to <#${channelId}>`,
      color: 0x57f287
    })]
  });
}

module.exports = { publishUpdateCmd };
