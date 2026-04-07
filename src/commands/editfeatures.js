const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");
const { getKeylessText, getPremiumText } = require("./features");

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

const PREMIUM_PRICE_CFG = {
  channelId: "1284907876758061197",
  messageId: "1485890605581074484",
};

function today() {
  const d = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function fetchMsg(channelId, messageId) {
  const res = await fetch(`${API}/channels/${channelId}/messages/${messageId}`, { headers: headers() });
  if (!res.ok) return null;
  return await res.json();
}

async function editMsg(channelId, messageId, payload) {
  await fetch(`${API}/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(payload),
  });
}

// ── Open keyless modal (called from updatehub) ──

async function openKeylessModal() {
  const text = await getKeylessText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editkeyless",
      title: "Edit Keyless Features",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "kl_all",
          label: "Use [Category] headers, one feature/line",
          style: 2,
          value: text,
          placeholder: "[⚔️ Combat]\nAuto Block\n\n[🧬 Abilities]\nAuto WCS",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

// ── Open premium features modal (called from updatehub) ──

async function openPremiumFeaturesModal() {
  const text = await getPremiumText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editpremium",
      title: "Edit Premium Features",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "prem_all",
          label: "One feature per line",
          style: 2,
          value: text,
          placeholder: "Always Downslam\nAuto Aim Abilities\nHitbox Extender",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

// ── Open premium prices modal (called from updatehub) ──

async function openPricesModal() {
  let currentDescription = "";
  try {
    const msg = await fetchMsg(PREMIUM_PRICE_CFG.channelId, PREMIUM_PRICE_CFG.messageId);
    if (msg?.embeds?.[0]) {
      currentDescription = msg.embeds[0].description || "";
    }
  } catch {
    return ephemeral({ content: "Error fetching pricing message." });
  }

  return {
    type: 9,
    data: {
      custom_id: "modal_editprices",
      title: "Update Prices",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "price_content",
          label: "Enter New Price/Description",
          style: 2,
          value: currentDescription,
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

// ── Modal submissions ──

async function handleModalSubmit(data) {
  const id = data.custom_id;

  if (id === "modal_editkeyless") {
    const raw = data.components[0].components[0].value;
    const sections = parseSections(raw);
    const total = Object.values(sections).flat().length;
    await store.set("features:keyless:raw", raw.trim());
    await store.set("features:keyless:updated", today());
    return ephemeral({
      embeds: [{
        title: "✅ Keyless Features Updated",
        description: `**${total}** features saved across **${Object.keys(sections).length}** categories.`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editpremium") {
    const raw = data.components[0].components[0].value;
    const feats = raw.split("\n").map(f => f.trim()).filter(Boolean);
    await store.set("features:premium:raw", raw.trim());
    await store.set("features:premium:updated", today());
    return ephemeral({
      embeds: [{
        title: "✅ Premium Features Updated",
        description: `**${feats.length}** premium features saved.`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editprices") {
    const newContent = data.components[0].components[0].value;
    try {
      const msg = await fetchMsg(PREMIUM_PRICE_CFG.channelId, PREMIUM_PRICE_CFG.messageId);
      if (!msg) return ephemeral({ content: "❌ Failed to update price message." });

      const newEmbed = { ...msg.embeds[0] };
      newEmbed.description = newContent;
      newEmbed.footer = { text: `Prices last updated: ${today()}` };

      await editMsg(PREMIUM_PRICE_CFG.channelId, PREMIUM_PRICE_CFG.messageId, {
        embeds: [newEmbed],
        components: msg.components,
      });

      return ephemeral({ content: "✅ Premium prices updated successfully!" });
    } catch (err) {
      console.error(err);
      return ephemeral({ content: "❌ Failed to update price message." });
    }
  }

  return null;
}

module.exports = {
  openKeylessModal,
  openPremiumFeaturesModal,
  openPricesModal,
  handleModalSubmit,
};
