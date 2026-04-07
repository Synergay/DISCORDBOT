const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");
const { getKeylessText } = require("./features");
const { getPriceText } = require("./priceinfo");

const API = "https://discord.com/api/v10";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
});

function hasEditRole(member) {
  const allowed = (process.env.EDITOR_ROLE_IDS || "").split(",").map(r => r.trim()).filter(Boolean);
  if (!allowed.length) return false;
  const roles = member.roles || [];
  return roles.some(r => allowed.includes(r));
}

function today() {
  const d = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function noPerms() {
  return ephemeral({ content: "you don't have permission to edit this." });
}

async function getPanel(type) {
  const raw = await store.get(`panel:${type}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
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

async function openKeylessModal(member) {
  if (!hasEditRole(member)) return noPerms();
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
          placeholder: "[\u2694\uFE0F Combat]\nAuto Block\n\n[\u{1F9EC} Abilities]\nAuto WCS",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

async function openPriceModal(member) {
  if (!hasEditRole(member)) return noPerms();

  const panel = await getPanel("priceinfo");
  let currentText = "";

  if (panel) {
    const msg = await fetchMsg(panel.channelId, panel.messageId);
    if (msg?.embeds?.[0]) {
      currentText = msg.embeds[0].description || "";
    }
  }

  if (!currentText) {
    currentText = await getPriceText();
  }

  return {
    type: 9,
    data: {
      custom_id: "modal_editprice",
      title: "Edit Price Info",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "content",
          label: "Update pricing (raw embed text)",
          style: 2,
          value: currentText,
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

async function handleModalSubmit(data) {
  const id = data.custom_id;
  const raw = data.components[0].components[0].value;

  if (id === "modal_editkeyless") {
    const sections = parseSections(raw);
    const total = Object.values(sections).flat().length;
    await store.set("features:keyless:raw", raw.trim());
    await store.set("features:keyless:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Keyless Features Updated",
        description: `**${total}** features saved across **${Object.keys(sections).length}** categories.`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editprice") {
    const panel = await getPanel("priceinfo");

    if (!panel) return ephemeral({ content: "no price panel found. run `/setup` first." });

    const msg = await fetchMsg(panel.channelId, panel.messageId);
    if (!msg) return ephemeral({ content: "couldn't fetch the price message." });

    const embed = { ...msg.embeds[0] };
    embed.description = raw;

    await editMsg(panel.channelId, panel.messageId, { embeds: [embed], components: msg.components });

    await store.set("priceinfo:raw", raw.trim());

    return ephemeral({
      embeds: [{
        title: "\u2705 Price Info Updated",
        description: "live message has been edited.",
        color: 0xffd700,
      }]
    });
  }

  return null;
}

module.exports = { openKeylessModal, openPriceModal, handleModalSubmit, hasEditRole };
