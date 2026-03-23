const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { getKeyless, getPremium, CAT_KEYS, DEFAULT_KEYLESS, DEFAULT_PREMIUM } = require("./features");

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

async function openPremModal(member) {
  if (!hasEditRole(member)) return ephemeral({ content: "you don't have permission to edit features." });

  const prem = await getPremium();
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
          value: prem.join("\n"),
          required: true,
          max_length: 4000,
        }]
      }]
    }
  };
}

async function openKeylessModal(member) {
  if (!hasEditRole(member)) return ephemeral({ content: "you don't have permission to edit features." });

  const kl = await getKeyless();
  const labels = Object.keys(kl);
  const components = CAT_KEYS.map((cat, i) => {
    const label = labels.find(l => l.includes(cat.label.slice(2).trim())) || cat.label;
    const feats = kl[label] || kl[Object.keys(kl)[i]] || [];
    return {
      type: 1,
      components: [{
        type: 4,
        custom_id: `kl_${cat.key}`,
        label: cat.label.length > 45 ? cat.label.slice(0, 45) : cat.label,
        style: 2,
        value: feats.join("\n"),
        required: true,
        max_length: 4000,
      }]
    };
  });

  return {
    type: 9,
    data: {
      custom_id: "modal_editkeyless",
      title: "Edit Keyless Features",
      components,
    }
  };
}

async function handleModalSubmit(data) {
  const id = data.custom_id;

  if (id === "modal_editprem") {
    const raw = data.components[0].components[0].value;
    const features = raw.split("\n").map(f => f.trim()).filter(Boolean);
    await store.set("features:premium", JSON.stringify(features));
    await store.set("features:premium:updated", today());
    return ephemeral({
      embeds: [{
        title: "\u2705 Premium Features Updated",
        description: `**${features.length}** features saved.\n\n${features.map(f => `> ${f}`).join("\n")}`,
        color: 0xffd700,
      }]
    });
  }

  if (id === "modal_editkeyless") {
    const kl = {};
    for (const row of data.components) {
      const input = row.components[0];
      const cat = CAT_KEYS.find(c => `kl_${c.key}` === input.custom_id);
      if (cat) {
        kl[cat.label] = input.value.split("\n").map(f => f.trim()).filter(Boolean);
      }
    }
    await store.set("features:keyless", JSON.stringify(kl));
    await store.set("features:keyless:updated", today());
    const total = Object.values(kl).flat().length;
    return ephemeral({
      embeds: [{
        title: "\u2705 Keyless Features Updated",
        description: `**${total}** features saved across ${Object.keys(kl).length} categories.`,
        color: 0x57f287,
      }]
    });
  }

  return null;
}

module.exports = { openPremModal, openKeylessModal, handleModalSubmit, hasEditRole };
