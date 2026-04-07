const { reply, ephemeral } = require("../utils/respond");
const features = require("./features");
const credits = require("./credits");
const execlist = require("./execlist");
const scripts = require("./scripts");

// ── /info command ──

function infoCmd() {
  return reply({
    embeds: [{
      title: "ℹ️ Xenon Hub — Info",
      description: "Select a category below to view information.",
      color: 0x5865f2,
      footer: { text: "Xenon Hub • Choose from the dropdown" },
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "info_main_select",
        placeholder: "Choose a category...",
        options: [
          { label: "Keyless Features", value: "info_keyless", emoji: { name: "🔓" }, description: "View all free keyless features" },
          { label: "Premium Features", value: "info_premium", emoji: { name: "💎" }, description: "View premium-only features" },
          { label: "Executors", value: "info_executors", emoji: { name: "🎮" }, description: "View supported executor compatibility" },
          { label: "Scripts", value: "info_scripts", emoji: { name: "📜" }, description: "View and copy script loadstrings" },
          { label: "Credits", value: "info_credits", emoji: { name: "👤" }, description: "View bot developer info" },
        ]
      }]
    }]
  });
}

// ── Component handler ──

async function handleInfoSelect(value) {
  if (value === "info_keyless") {
    return await features.handleBtn("features_keyless");
  }

  if (value === "info_premium") {
    return await features.handleBtn("features_premium");
  }

  if (value === "info_executors") {
    return execlist.execListCmd();
  }

  if (value === "info_scripts") {
    return await scripts.scriptsCmd();
  }

  if (value === "info_credits") {
    return credits.handleBtn("credits_view");
  }

  return ephemeral({ content: "Unknown selection." });
}

module.exports = { infoCmd, handleInfoSelect };
