const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");
const { getKeylessText, getPremiumText } = require("./features");
const { getExecText } = require("./executors");
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

// --- premium modal ---

async function openPremModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const text = await getPremiumText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editprem",
      title: "Edit Premium Features",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "prem_features",
          label: "Features (one per line)",
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

// --- keyless modal ---

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

// --- executors modal (fetches live message) ---

async function openExecModal(member, embedIndex) {
  if (!hasEditRole(member)) return noPerms();

  const panel = await getPanel("executors");
  let currentText = "";
  const label = embedIndex === 0 ? "PC" : "Mobile";

  if (panel) {
    const msg = await fetchMsg(panel.channelId, panel.messageId);
    if (msg?.embeds?.[embedIndex]) {
      currentText = msg.embeds[embedIndex].description || "";
    }
  }

  if (!currentText) {
    const full = await getExecText();
    const sections = parseSections(full);
    const keys = Object.keys(sections);
    if (embedIndex === 0) {
      const pcPaid = sections["PC PAID"] || [];
      const pcFree = sections["PC FREE"] || [];
      currentText = formatExecEmbed("PC PAID", pcPaid, "PC FREE", pcFree);
    } else {
      const mobile = sections["MOBILE"] || [];
      currentText = formatExecEmbed("MOBILE", mobile);
    }
  }

  return {
    type: 9,
    data: {
      custom_id: `modal_editexec_${embedIndex}`,
      title: `Edit Executors (${label})`,
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "content",
          label: `Update ${label} Executors`,
          style: 2,
          value: currentText,
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

function formatExecEmbed(...args) {
  const parts = [];
  for (let i = 0; i < args.length; i += 2) {
    if (typeof args[i] === "string" && Array.isArray(args[i + 1])) {
      parts.push(args[i] + " ~\n");
      parts.push(args[i + 1].map(f => `\u2022 ${f}`).join("\n"));
      parts.push("");
    }
  }
  return parts.join("\n").trim();
}

// --- price modal (fetches live message) ---

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

// --- exec full modal (section format for Redis) ---

async function openExecFullModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const text = await getExecText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editexec_full",
      title: "Edit All Executors",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "exec_all",
          label: "Use [Section] headers, one executor/line",
          style: 2,
          value: text,
          placeholder: "[PC PAID]\nSELIWARE - Works\n\n[MOBILE]\nDelta - Works",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

// --- modal submit handler ---

async function handleModalSubmit(data) {
  const id = data.custom_id;
  const raw = data.components[0].components[0].value;

  // premium features (Redis + live features panel stays button-based)
  if (id === "modal_editprem") {
    const feats = raw.split("\n").map(f => f.trim()).filter(Boolean);
    await store.set("features:premium:raw", raw.trim());
    await store.set("features:premium:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Premium Features Updated",
        description: `**${feats.length}** features saved.`,
        color: 0xffd700,
      }]
    });
  }

  // keyless features (Redis)
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

  // executors PC or Mobile (direct message edit)
  if (id === "modal_editexec_0" || id === "modal_editexec_1") {
    const index = parseInt(id.split("_").pop());
    const panel = await getPanel("executors");

    if (!panel) return ephemeral({ content: "no executors panel found. run `/setup` first." });

    const msg = await fetchMsg(panel.channelId, panel.messageId);
    if (!msg) return ephemeral({ content: "couldn't fetch the executors message." });

    const embeds = msg.embeds.map(e => ({ ...e }));
    embeds[index].description = raw;

    const date = today();
    embeds.forEach(e => {
      e.footer = { text: `Last updated: ${date}` };
    });

    await editMsg(panel.channelId, panel.messageId, { embeds });

    const label = index === 0 ? "PC" : "Mobile";
    return ephemeral({
      embeds: [{
        title: `\u2705 ${label} Executors Updated`,
        description: "live message has been edited.",
        color: 0x57f287,
      }]
    });
  }

  // executors full (Redis + rebuild live message)
  if (id === "modal_editexec_full") {
    const sections = parseSections(raw);
    const total = Object.values(sections).flat().length;
    await store.set("executors:raw", raw.trim());
    await store.set("executors:updated", today());

    // also rebuild and edit live message
    const panel = await getPanel("executors");
    if (panel) {
      const { executorsCmd } = require("./executors");
      const result = await executorsCmd();
      if (result?.data?.embeds) {
        await editMsg(panel.channelId, panel.messageId, { embeds: result.data.embeds });
      }
    }

    return ephemeral({
      embeds: [{
        title: "\u2705 Executors Updated",
        description: `**${total}** executors saved. Live message updated.`,
        color: 0x57f287,
      }]
    });
  }

  // price info (direct message edit)
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

module.exports = {
  openPremModal,
  openKeylessModal,
  openExecModal,
  openExecFullModal,
  openPriceModal,
  handleModalSubmit,
  hasEditRole,
};
