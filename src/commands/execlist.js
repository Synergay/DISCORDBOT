const { reply, ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

const DEFAULT_LISTS = {
  pc_paid: "• Potassium (Recommended)\n• Volt (detected but works)\n• Wave (sometime works)\n• Isaeva (works)\n• Synapse Z (everything works)\n• Sirhurt (everything works)",
  pc_free: "• Velocity (Recommended)\n• Asteroid (works, use at your own risk)\n• Yubx (detected but works)\n• Ronix (needs downgrade)\n• Xeno (some features won't work)\n• solara (not supported)",
  mob_android: "• Delta (Recommended)\n• Vega X (some features won't work)\n• Codex (some features wont work)",
  mob_ios: "• Delta (Recommended)\n• Others (might work, not tested)",
};

const LIST_LABELS = {
  pc_paid: { title: "PC", cat: "PAID" },
  pc_free: { title: "PC", cat: "FREE" },
  mob_android: { title: "Mobile", cat: "Android" },
  mob_ios: { title: "Mobile", cat: "IOS" },
};

const DROPDOWN_OPTIONS = {
  pc_paid: { label: "PC — Paid", emoji: { name: "💻" } },
  pc_free: { label: "PC — Free", emoji: { name: "🖥️" } },
  mob_android: { label: "Mobile — Android", emoji: { name: "📱" } },
  mob_ios: { label: "Mobile — iOS", emoji: { name: "🍎" } },
};

// ── Helpers ──

function getSuffix(d) {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function getDate() {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "long" });
  const yr = d.getFullYear().toString().slice(-2);
  return `${day}${getSuffix(day)} of ${month} ${yr}`;
}

async function getLastUpdated() {
  return await store.get("execlist:updated") || "24th of March 26";
}

async function getListText(key) {
  return await store.get(`execlist:${key}`) || DEFAULT_LISTS[key] || "";
}

async function saveListText(key, text) {
  await store.set(`execlist:${key}`, text);
}

// ── /executors command (dropdowns) ──

function execListCmd() {
  return reply({
    content: "Select your platform:",
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "exec_platform_select",
        placeholder: "Select platform...",
        options: [
          { label: "PC", value: "exec_plat_pc", emoji: { name: "💻" } },
          { label: "Mobile", value: "exec_plat_mobile", emoji: { name: "📱" } },
        ]
      }]
    }]
  });
}

async function storePanel(channelId, messageId) {
  await store.set("execlist:panel", JSON.stringify({ channelId, messageId }));
}

// ── Component handlers for /executors display ──

function handlePlatformSelect(value) {
  if (value === "exec_plat_pc") {
    return ephemeral({
      content: "Choose PC Category:",
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: "exec_category_select",
          placeholder: "Select category...",
          options: [
            { label: "Free", value: "exec_cat_pc_free", emoji: { name: "🆓" } },
            { label: "Paid", value: "exec_cat_pc_paid", emoji: { name: "💰" } },
          ]
        }]
      }]
    });
  }

  if (value === "exec_plat_mobile") {
    return ephemeral({
      content: "Choose Mobile OS:",
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: "exec_category_select",
          placeholder: "Select OS...",
          options: [
            { label: "Android", value: "exec_cat_mob_android", emoji: { name: "📱" } },
            { label: "iOS", value: "exec_cat_mob_ios", emoji: { name: "🍎" } },
          ]
        }]
      }]
    });
  }

  return null;
}

async function handleCategorySelect(value) {
  const key = value.replace("exec_cat_", "");
  const meta = LIST_LABELS[key];
  if (!meta) return null;

  const list = await getListText(key);
  const updated = await getLastUpdated();

  return ephemeral({
    embeds: [{
      title: meta.title,
      color: 0x90ee90,
      description: `✧⸻⸻⸻⸻⸻⸻✧\n\n**${meta.cat}**\n\n${list}\n\n✧⸻⸻⸻⸻⸻⸻✧`,
      footer: { text: `(${updated})` },
    }]
  });
}

// ── Update executor sub-flows (called from updatehub) ──

function updateExecMenu() {
  const options = Object.entries(DROPDOWN_OPTIONS).map(([val, opt]) => ({
    label: opt.label,
    value: `exec_edit_${val}`,
    emoji: opt.emoji,
  }));

  return ephemeral({
    embeds: [{
      title: "🎮 Update Executor",
      description: "Which executor list do you want to edit?",
      color: 0x5865f2,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "exec_edit_select",
        placeholder: "Select executor list...",
        options,
      }]
    }]
  });
}

async function handleEditSelect(value) {
  const key = value.replace("exec_edit_", "");
  const meta = LIST_LABELS[key];
  if (!meta) return ephemeral({ content: "Invalid selection." });

  const current = await getListText(key);

  return {
    type: 9,
    data: {
      custom_id: `modal_exec_edit_${key}`,
      title: `Edit ${meta.title} — ${meta.cat}`,
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "exec_list",
          label: "Executor list (one per line, use • prefix)",
          style: 2,
          value: current,
          required: true,
          max_length: 4000,
          placeholder: "• ExecutorName (Recommended)\n• AnotherExecutor (works)",
        }]
      }]
    }
  };
}

async function handleEditModal(data) {
  const match = data.custom_id.match(/^modal_exec_edit_(.+)$/);
  if (!match) return null;

  const key = match[1];
  const meta = LIST_LABELS[key];
  if (!meta) return ephemeral({ content: "Invalid executor key." });

  const newText = data.components[0].components[0].value.trim();
  const date = getDate();

  await saveListText(key, newText);
  await store.set("execlist:updated", date);

  // Try to edit the panel message
  const raw = await store.get("execlist:panel");
  if (raw) {
    try {
      const panel = typeof raw === "string" ? JSON.parse(raw) : raw;
      await fetch(`${API}/channels/${panel.channelId}/messages/${panel.messageId}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          content: `Select your platform:\nLast Updated: **${date}**`,
          components: [{
            type: 1,
            components: [{
              type: 3,
              custom_id: "exec_platform_select",
              placeholder: "Select platform...",
              options: [
                { label: "PC", value: "exec_plat_pc", emoji: { name: "💻" } },
                { label: "Mobile", value: "exec_plat_mobile", emoji: { name: "📱" } },
              ]
            }]
          }]
        }),
      });
    } catch {}
  }

  return ephemeral({
    embeds: [{
      title: "✅ Executor List Updated",
      description: `**${meta.title} — ${meta.cat}** updated.\nTimestamp set to **${date}**.`,
      color: 0x57f287,
    }]
  });
}

module.exports = {
  execListCmd,
  storePanel,
  handlePlatformSelect,
  handleCategorySelect,
  updateExecMenu,
  handleEditSelect,
  handleEditModal,
};
