const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");
const { getKeylessText, getPremiumText } = require("./features");
const { getExecText } = require("./executors");
const { getPriceText } = require("./priceinfo");

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
          placeholder: "[\u2694\uFE0F Combat]\nAuto Block\nAuto Counter\n\n[\u{1F9EC} Abilities]\nAuto WCS",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

async function openExecModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const text = await getExecText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editexec",
      title: "Edit Executors",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "exec_all",
          label: "Use [Section] headers, one executor/line",
          style: 2,
          value: text,
          placeholder: "[PC PAID]\nSELIWARE - Works\n\n[PC FREE]\nVelocity - Works\n\n[MOBILE]\nDelta - Works",
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

async function openPriceModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const text = await getPriceText();
  return {
    type: 9,
    data: {
      custom_id: "modal_editprice",
      title: "Edit Price Info",
      components: [{
        type: 1,
        components: [{
          type: 4,
          custom_id: "price_all",
          label: "Use [Section], Name|Price per item",
          style: 2,
          value: text,
          placeholder: "[PAYMENT METHODS]\nPaypal|\u00A34.99 - 1 MONTH\n\n[NOTES]\nSome note here",
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

  if (id === "modal_editprem") {
    const feats = raw.split("\n").map(f => f.trim()).filter(Boolean);
    await store.set("features:premium:raw", raw.trim());
    await store.set("features:premium:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Premium Features Updated",
        description: `**${feats.length}** features saved.\n\n${feats.map(f => `> ${f}`).join("\n")}`,
        color: 0xffd700,
      }]
    });
  }

  if (id === "modal_editkeyless") {
    const sections = parseSections(raw);
    const total = Object.values(sections).flat().length;
    const cats = Object.keys(sections).length;
    await store.set("features:keyless:raw", raw.trim());
    await store.set("features:keyless:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Keyless Features Updated",
        description: `**${total}** features saved across **${cats}** categories.`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editexec") {
    const sections = parseSections(raw);
    const total = Object.values(sections).flat().length;
    await store.set("executors:raw", raw.trim());
    await store.set("executors:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Executors Updated",
        description: `**${total}** executors saved across **${Object.keys(sections).length}** sections.`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editprice") {
    await store.set("priceinfo:raw", raw.trim());
    return ephemeral({
      embeds: [{
        title: "\u2705 Price Info Updated",
        description: "all pricing has been saved.",
        color: 0xffd700,
      }]
    });
  }

  return null;
}

module.exports = { openPremModal, openKeylessModal, openExecModal, openPriceModal, handleModalSubmit, hasEditRole };
