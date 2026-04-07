const { ephemeral, deferReply } = require("../utils/respond");
const store = require("../utils/store");

const OWNER_ID = "1051444466235486298";
const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

function hasPerm(member) {
  const perms = BigInt(member.permissions || "0");
  const MANAGE_MESSAGES = 1n << 13n;
  const ADMINISTRATOR = 1n << 3n;
  return (perms & MANAGE_MESSAGES) !== 0n || (perms & ADMINISTRATOR) !== 0n;
}

// ── /backfill command — returns deferred, then processes async ──

function backfillCmd(opts, member) {
  const userId = member.user?.id || member.id;
  if (userId !== OWNER_ID && !hasPerm(member)) {
    return ephemeral({
      embeds: [{
        title: "🚫 Permission Denied",
        description: "You need **Manage Messages** or be the owner to use this.",
        color: 0xed4245,
      }]
    });
  }
  // Return deferred — the actual work happens in runBackfill()
  return deferReply(true);
}

// ── Async backfill processing (called after deferred response) ──

async function runBackfill(opts, guildId, appId, token) {
  const target = opts.target;  // "channel" or "all"
  const mode = opts.mode;      // "overwrite" or "add"
  const channelId = opts._channel_id;

  const followUp = async (content) => {
    await fetch(`${API}/webhooks/${appId}/${token}/messages/@original`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(typeof content === "string" ? { content } : content),
    });
  };

  try {
    const counts = {}; // userId -> count

    if (target === "channel") {
      await followUp({ embeds: [{ title: "⏳ Backfill", description: `Scanning <#${channelId}>...`, color: 0xfee75c }] });
      await scanChannel(channelId, counts);
    } else {
      // Scan all text channels
      const chRes = await fetch(`${API}/guilds/${guildId}/channels`, { headers: headers() });
      if (!chRes.ok) {
        return await followUp("❌ Failed to fetch guild channels.");
      }
      const channels = await chRes.json();
      const textChannels = channels.filter(c => c.type === 0 || c.type === 5);

      await followUp({ embeds: [{ title: "⏳ Backfill", description: `Scanning ${textChannels.length} channels...`, color: 0xfee75c }] });

      for (let i = 0; i < textChannels.length; i++) {
        try {
          await scanChannel(textChannels[i].id, counts);
        } catch { /* skip inaccessible channels */ }
      }
    }

    // Store counts
    const userIds = Object.keys(counts);
    for (const uid of userIds) {
      const key = `msgcount:${guildId}:${uid}`;
      if (mode === "add") {
        const existing = parseInt(await store.get(key) || "0");
        await store.set(key, String(existing + counts[uid]));
      } else {
        await store.set(key, String(counts[uid]));
      }
    }

    const totalMsgs = Object.values(counts).reduce((a, b) => a + b, 0);
    await followUp({
      embeds: [{
        title: "✅ Backfill Complete",
        description: `**${totalMsgs.toLocaleString()}** messages counted across **${userIds.length}** users.\nMode: **${mode}**\nTarget: **${target === "all" ? "All channels" : `<#${channelId}>`}**`,
        color: 0x57f287,
      }]
    });
  } catch (err) {
    await followUp(`❌ Backfill error: ${err.message}`).catch(() => {});
  }
}

async function scanChannel(channelId, counts) {
  let before = null;
  let total = 0;

  while (true) {
    let url = `${API}/channels/${channelId}/messages?limit=100`;
    if (before) url += `&before=${before}`;

    const res = await fetch(url, { headers: headers() });
    if (!res.ok) break;

    const messages = await res.json();
    if (!messages.length) break;

    for (const msg of messages) {
      if (msg.author.bot) continue;
      counts[msg.author.id] = (counts[msg.author.id] || 0) + 1;
    }

    before = messages[messages.length - 1].id;
    total += messages.length;

    if (messages.length < 100) break;
  }

  return total;
}

module.exports = { backfillCmd, runBackfill };
