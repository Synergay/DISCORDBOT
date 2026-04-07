const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const TICKET_BOT_ID = "710034409214181396";
const WHITELIST_BOT_ID = "1429900417872957522";

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

const GUILD_ID = "1274036834787131432";

// ── Ticket type definitions ──

const TICKET_TYPES = {
  1: {
    label: "Script Support",
    embedTitle: "₊˚✧ Script Support ✧˚₊",
    roleId: "1490997225151664209",
  },
  2: {
    label: "Server Support",
    embedTitle: "₊˚✧ Server Support ✧˚₊",
    roleId: "1490997507738697748",
  },
  3: {
    label: "Purchase Premium",
    embedTitle: "₊˚✧ Purchase Premium ✧˚₊",
    roleId: "1485007498007281724",
  },
  4: {
    label: "Purchase Robux",
    embedTitle: "₊˚✧ Purchase Robux ✧˚₊",
    roleId: "1489067802047418669",
  },
  5: {
    label: "Staff Application",
    embedTitle: "₊˚✧ Staff Application ✧˚₊",
    roleId: "1491126409962197012",
  },
};

// ── Config helpers ──

async function getToggle(num) {
  const raw = await store.get(`ticket:toggle:${num}`);
  return raw === "1" || raw === "true";
}

async function setToggle(num, enabled) {
  await store.set(`ticket:toggle:${num}`, enabled ? "1" : "0");
}

async function getMsgThreshold() {
  const val = await store.get("ticket:threshold:5");
  return val ? parseInt(val) : 500;
}

async function setMsgThreshold(val) {
  await store.set("ticket:threshold:5", String(val));
}

async function isProcessed(msgId) {
  const val = await store.get(`ticket:processed:${msgId}`);
  return !!val;
}

async function markProcessed(msgId) {
  await store.set(`ticket:processed:${msgId}`, "1");
}

// ── Update hub sub-menu ──

async function updateTicketsMenu() {
  const toggles = {};
  for (let i = 1; i <= 5; i++) {
    toggles[i] = await getToggle(i);
  }
  const threshold = await getMsgThreshold();

  const lines = [];
  for (let i = 1; i <= 5; i++) {
    const t = TICKET_TYPES[i];
    const status = toggles[i] ? "✅ ON" : "❌ OFF";
    lines.push(`**${i}. ${t.label}** — ${status}`);
  }
  lines.push(`\n**Staff App Msg Threshold:** ${threshold}`);

  return ephemeral({
    embeds: [{
      title: "🎫 Ticket Settings",
      description: lines.join("\n"),
      color: 0x5865f2,
    }],
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: toggles[1] ? 4 : 3, label: `1. Script Support: ${toggles[1] ? "ON" : "OFF"}`, custom_id: "ticket_toggle_1" },
          { type: 2, style: toggles[2] ? 4 : 3, label: `2. Server Support: ${toggles[2] ? "ON" : "OFF"}`, custom_id: "ticket_toggle_2" },
          { type: 2, style: toggles[3] ? 4 : 3, label: `3. Purchase Premium: ${toggles[3] ? "ON" : "OFF"}`, custom_id: "ticket_toggle_3" },
        ]
      },
      {
        type: 1,
        components: [
          { type: 2, style: toggles[4] ? 4 : 3, label: `4. Purchase Robux: ${toggles[4] ? "ON" : "OFF"}`, custom_id: "ticket_toggle_4" },
          { type: 2, style: toggles[5] ? 4 : 3, label: `5. Staff Application: ${toggles[5] ? "ON" : "OFF"}`, custom_id: "ticket_toggle_5" },
          { type: 2, style: 1, label: "Edit Msg Threshold", custom_id: "ticket_edit_threshold", emoji: { name: "✏️" } },
        ]
      }
    ]
  });
}

// ── Component handlers ──

async function handleTicketToggle(num) {
  const current = await getToggle(num);
  await setToggle(num, !current);
  // Re-render the entire menu
  return await updateTicketsMenu();
}

function handleThresholdBtn() {
  return {
    type: 9,
    data: {
      custom_id: "modal_ticket_threshold",
      title: "Edit Staff App Msg Threshold",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "threshold_value",
          label: "Minimum messages required (default 500)",
          style: 1,
          required: true,
          max_length: 10,
          placeholder: "e.g. 500",
        }]
      }]
    }
  };
}

async function handleThresholdModal(data) {
  const val = parseInt(data.components[0].components[0].value.trim());
  if (isNaN(val) || val < 0) {
    return ephemeral({ content: "❌ Must be a valid number ≥ 0." });
  }
  await setMsgThreshold(val);
  return ephemeral({
    embeds: [{
      title: "✅ Threshold Updated",
      description: `Staff Application message threshold set to **${val}**.`,
      color: 0x57f287,
    }]
  });
}

// ── Discord API helpers ──

async function sendMessage(channelId, payload) {
  const body = typeof payload === "string" ? { content: payload } : payload;
  await fetch(`${API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
}

async function setRolePermission(channelId, roleId) {
  await fetch(`${API}/channels/${channelId}/permissions/${roleId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      allow: "1024", // VIEW_CHANNEL
      deny: "0",
      type: 0, // role
    }),
  });
}

async function deleteChannel(channelId) {
  await fetch(`${API}/channels/${channelId}`, {
    method: "DELETE",
    headers: headers(),
  });
}

function extractMention(content) {
  if (!content) return null;
  const match = content.match(/<@!?(\d+)>/);
  return match ? match[1] : null;
}

// ── Main cron processor ──

async function processTicketChannels() {
  // Check if any toggle is ON
  let anyEnabled = false;
  const toggles = {};
  for (let i = 1; i <= 5; i++) {
    toggles[i] = await getToggle(i);
    if (toggles[i]) anyEnabled = true;
  }
  if (!anyEnabled) return { processed: 0, skipped: "all toggles off" };

  // Fetch all guild channels
  const chRes = await fetch(`${API}/guilds/${GUILD_ID}/channels`, { headers: headers() });
  if (!chRes.ok) return { error: "failed to fetch channels" };

  const channels = await chRes.json();
  const ticketChannels = channels.filter(c => c.name && c.name.startsWith("ticket-"));

  let processed = 0;

  for (const channel of ticketChannels) {
    try {
      // Fetch recent messages (last 20)
      const msgRes = await fetch(`${API}/channels/${channel.id}/messages?limit=20`, { headers: headers() });
      if (!msgRes.ok) continue;

      const messages = await msgRes.json();

      // Process ticket bot messages
      for (const msg of messages) {
        if (msg.author.id !== TICKET_BOT_ID) continue;
        if (!msg.embeds || !msg.embeds.length) continue;
        if (await isProcessed(msg.id)) continue;

        const embedTitle = msg.embeds[0].title || "";
        const mentionedUserId = extractMention(msg.content);

        for (let i = 1; i <= 5; i++) {
          if (!toggles[i]) continue;
          if (embedTitle !== TICKET_TYPES[i].embedTitle) continue;

          await processTicketType(i, channel.id, mentionedUserId, messages);
          await markProcessed(msg.id);
          processed++;
          break;
        }
      }

      // Check for whitelist bot messages (Purchase Premium additional check)
      if (toggles[3]) {
        for (const msg of messages) {
          if (msg.author.id !== WHITELIST_BOT_ID) continue;
          if (!msg.content || !msg.content.includes("You have been whitelisted!")) continue;
          if (await isProcessed(`wl_${msg.id}`)) continue;

          const userId = extractMention(msg.content);
          if (userId) {
            // Give role
            try {
              await fetch(`${API}/guilds/${GUILD_ID}/members/${userId}/roles/1284904586259202119`, {
                method: "PUT",
                headers: headers(),
              });
            } catch {}

            // Send confirmation embed
            await sendMessage(channel.id, {
              embeds: [{
                description: `<@${userId}> has been given <@&1284904586259202119>`,
                color: 0x5dade2, // light blue
              }]
            });

            await markProcessed(`wl_${msg.id}`);
            processed++;
          }
        }
      }
    } catch (err) {
      // Skip channels with errors
      continue;
    }
  }

  return { processed, channels: ticketChannels.length };
}

async function processTicketType(type, channelId, mentionedUserId, messages) {
  const cfg = TICKET_TYPES[type];

  switch (type) {
    case 1: // Script Support
      await sendMessage(channelId, `<@&${cfg.roleId}>`);
      await setRolePermission(channelId, cfg.roleId);
      break;

    case 2: // Server Support
      await sendMessage(channelId, `<@&${cfg.roleId}>`);
      await setRolePermission(channelId, cfg.roleId);
      break;

    case 3: // Purchase Premium
      await sendMessage(channelId, "jay745934@gmail.com");
      await sendMessage(channelId, "↑ The above email is used for Paypal");
      await sendMessage(channelId, "https://revolut.me/jay0lypl is used for card");
      await sendMessage(channelId, `<@&${cfg.roleId}>`);
      await setRolePermission(channelId, cfg.roleId);
      break;

    case 4: // Purchase Robux
      await sendMessage(channelId, {
        content: `<@&${cfg.roleId}> A new robux ticket, please attend it`,
        embeds: [{
          title: "🎫 Robux Ticket",
          description: "A new robux purchase ticket has been opened.",
          color: 0xe6d3a3,
        }],
      });
      await setRolePermission(channelId, cfg.roleId);
      break;

    case 5: { // Staff Application
      await sendMessage(channelId, `<@&${cfg.roleId}>`);
      await setRolePermission(channelId, cfg.roleId);

      if (mentionedUserId) {
        const threshold = await getMsgThreshold();
        const countRaw = await store.get(`msgcount:${GUILD_ID}:${mentionedUserId}`);
        const count = countRaw ? parseInt(countRaw) : 0;

        if (count < threshold) {
          await sendMessage(channelId, {
            embeds: [{
              title: "❌ Application Auto Denied",
              description: `<@${mentionedUserId}> has **${count}** messages (minimum: **${threshold}**).\n\nApplication auto denied\nDeleting within 15 seconds`,
              color: 0xed4245,
            }]
          });
          // Delete channel after 15 seconds
          setTimeout(async () => {
            try { await deleteChannel(channelId); } catch {}
          }, 15000);
        } else {
          await sendMessage(channelId, {
            embeds: [{
              title: "✅ Sufficient Messages",
              description: `<@${mentionedUserId}> has **${count}** messages (minimum: **${threshold}**).\n\nsufficient messages!\nPlease proceed with the application.`,
              color: 0x57f287,
            }]
          });
        }
      }
      break;
    }
  }
}

module.exports = {
  TICKET_TYPES,
  updateTicketsMenu,
  handleTicketToggle,
  handleThresholdBtn,
  handleThresholdModal,
  processTicketChannels,
};
