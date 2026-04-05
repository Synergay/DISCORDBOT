const { reply, ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const EXEC_LISTS = {
  pc_paid: {
    title: "PC", cat: "PAID",
    list: "\u2022 Potassium (Recommended)\n\u2022 Volt (detected but works)\n\u2022 Wave (sometime works)\n\u2022 Isaeva (works)\n\u2022 Synapse Z (everything works)\n\u2022 Sirhurt (everything works)",
  },
  pc_free: {
    title: "PC", cat: "FREE",
    list: "\u2022 Velocity (Recommended)\n\u2022 Asteroid (works, use at your own risk)\n\u2022 Yubx (detected but works)\n\u2022 Ronix (needs downgrade)\n\u2022 Xeno (some features won't work)\n\u2022 solara (not supported)",
  },
  mob_android: {
    title: "Mobile", cat: "Android",
    list: "\u2022 Delta (Recommended)\n\u2022 Vega X (some features won't work)\n\u2022 Codex (some features wont work)",
  },
  mob_ios: {
    title: "Mobile", cat: "IOS",
    list: "\u2022 Delta (Recommended)\n\u2022 Others (might work, not tested)",
  },
};

async function getLastUpdated() {
  return await store.get("execlist:updated") || "24th of March 26";
}

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

function execListCmd() {
  return reply({
    content: "Select your platform:",
    components: [{
      type: 1,
      components: [
        { type: 2, style: 1, label: "PC", custom_id: "exec_pc_main" },
        { type: 2, style: 3, label: "Mobile", custom_id: "exec_mobile_main" },
      ]
    }]
  });
}

async function updateExecTimestamp() {
  const date = getDate();
  await store.set("execlist:updated", date);
  return ephemeral({
    content: `\u2705 Lists updated to: **${date}**`,
  });
}

async function handleBtn(id) {
  if (id === "exec_pc_main") {
    return ephemeral({
      content: "Choose PC Category:",
      components: [{
        type: 1,
        components: [
          { type: 2, style: 2, label: "Free", custom_id: "exec_pc_free" },
          { type: 2, style: 2, label: "Paid", custom_id: "exec_pc_paid" },
        ]
      }]
    });
  }

  if (id === "exec_mobile_main") {
    return ephemeral({
      content: "Choose Mobile OS:",
      components: [{
        type: 1,
        components: [
          { type: 2, style: 2, label: "Android", custom_id: "exec_mob_android" },
          { type: 2, style: 2, label: "iOS", custom_id: "exec_mob_ios" },
        ]
      }]
    });
  }

  const key = id.replace("exec_", "");
  const data = EXEC_LISTS[key];
  if (data) {
    const updated = await getLastUpdated();
    return ephemeral({
      embeds: [{
        title: data.title,
        color: 0x90ee90,
        description: `\u2727\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2727\n\n**${data.cat}**\n\n${data.list}\n\n\u2727\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2727`,
        footer: { text: `(${updated})` },
      }]
    });
  }

  return null;
}

module.exports = { execListCmd, updateExecTimestamp, handleBtn };
