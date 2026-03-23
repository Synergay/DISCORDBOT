const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { getKeyless, getPremium, CAT_KEYS } = require("./features");
const { getData: getExecData } = require("./executors");
const { getData: getPriceData } = require("./priceinfo");

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
  if (!hasEditRole(member)) return noPerms();
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

async function openExecModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const data = await getExecData();
  return {
    type: 9,
    data: {
      custom_id: "modal_editexec",
      title: "Edit Executors",
      components: [
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "exec_pc_paid",
            label: "PC - Paid (one per line)",
            style: 2,
            value: data.pc_paid.join("\n"),
            required: true,
            max_length: 4000,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "exec_pc_free",
            label: "PC - Free (one per line)",
            style: 2,
            value: data.pc_free.join("\n"),
            required: true,
            max_length: 4000,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "exec_mobile",
            label: "Mobile (one per line)",
            style: 2,
            value: data.mobile.join("\n"),
            required: true,
            max_length: 4000,
          }]
        },
      ]
    }
  };
}

async function openPriceModal(member) {
  if (!hasEditRole(member)) return noPerms();
  const data = await getPriceData();
  return {
    type: 9,
    data: {
      custom_id: "modal_editprice",
      title: "Edit Price Info",
      components: [
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "price_paypal",
            label: "Paypal pricing",
            style: 2,
            value: data.paypal,
            required: true,
            max_length: 1000,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "price_seliware",
            label: "Seliware key pricing",
            style: 2,
            value: data.seliware,
            required: true,
            max_length: 1000,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "price_boosts",
            label: "Server boosts status",
            style: 1,
            value: data.boosts,
            required: true,
            max_length: 500,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "price_nitro",
            label: "Nitro status",
            style: 1,
            value: data.nitro,
            required: true,
            max_length: 500,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "price_notes",
            label: "Notes",
            style: 2,
            value: data.notes,
            required: true,
            max_length: 1000,
          }]
        },
      ]
    }
  };
}

function getField(data, id) {
  for (const row of data.components) {
    const input = row.components[0];
    if (input.custom_id === id) return input.value;
  }
  return "";
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

  if (id === "modal_editexec") {
    const parse = (fid) => getField(data, fid).split("\n").map(f => f.trim()).filter(Boolean);
    const exec = {
      pc_paid: parse("exec_pc_paid"),
      pc_free: parse("exec_pc_free"),
      mobile: parse("exec_mobile"),
    };
    await store.set("executors", JSON.stringify(exec));
    await store.set("executors:updated", today());
    const total = exec.pc_paid.length + exec.pc_free.length + exec.mobile.length;
    return ephemeral({
      embeds: [{
        title: "\u2705 Executors Updated",
        description: `**${total}** executors saved.\n\nPC Paid: ${exec.pc_paid.length}\nPC Free: ${exec.pc_free.length}\nMobile: ${exec.mobile.length}`,
        color: 0x57f287,
      }]
    });
  }

  if (id === "modal_editprice") {
    const prices = {
      paypal: getField(data, "price_paypal"),
      seliware: getField(data, "price_seliware"),
      boosts: getField(data, "price_boosts"),
      nitro: getField(data, "price_nitro"),
      notes: getField(data, "price_notes"),
    };
    await store.set("priceinfo", JSON.stringify(prices));
    return ephemeral({
      embeds: [{
        title: "\u2705 Price Info Updated",
        description: "all pricing fields have been saved.",
        color: 0xffd700,
      }]
    });
  }

  return null;
}

module.exports = { openPremModal, openKeylessModal, openExecModal, openPriceModal, handleModalSubmit, hasEditRole };
