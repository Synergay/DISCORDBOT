const { reply, ephemeral } = require("../utils/respond");

const KEYLESS = {
  "\u2694\uFE0F Combat": [
    "Auto Block",
    "Auto Counter",
    "Punish After Block",
    "Punish After Dash",
    "Side Dash Assist",
    "Always Uppercut",
    "Legit Auto Downslam",
    "Legit Auto Uppercut",
    "Anti Domain",
    "Legit Block Break",
    "Force Method",
    "TP Block",
    "TP To Player",
    "Auto Black Flash",
    "Auto Feint Black Flash",
  ],
  "\u{1F9EC} Character Abilities": [
    "Auto WCS (Yuji Awk)",
    "Auto Feint (Yuji)",
    "Auto Execution (Higurama)",
    "Auto Perfect Clap (Todo)",
    "Auto R Variant (Todo)",
    "Auto R Hit (Todo)",
    "Auto Copy (Yuta)",
    "Auto Adapt (Mahoraga)",
    "Safe Summon Mahoraga",
    "Auto Higurama QTE",
    "Auto Higurama Domain",
    "Replace Jackpot Music (Hakari)",
    "Naoya Tech (Naoya)",
    "M1 Dodge (Haruta)",
    "Auto Backstab (Haruta)",
    "Auto Fly Frog Variant (Megumi)",
    "Auto Shadow Variant (Megumi)",
    "Garuda Special (Yuki)",
    "Rising Rage Special (Yuki)",
    "Mass Breaker Special (Yuki)",
    "Garuda Stab Special (Yuki)",
    "Auto Ult (Yuki)",
    "Auto Ratio (Salaryman)",
  ],
  "\u{1F4DD} Tools": [
    "Advanced Auto Combo Maker",
  ],
  "\u{1F441}\uFE0F ESP & Tracking": [
    "Box ESP",
    "Name ESP",
    "Health ESP",
    "Distance ESP",
    "Character ESP",
    "Tracer ESP",
    "CD Revealer",
    "Item ESP",
    "Character Lock On",
    "Camera Lock On",
    "TBO/JJS Lock On",
  ],
  "\u{1F3AE} Player": [
    "Spoof Username & Avatar",
    "No Stun",
    "Legit No Stun",
    "No Jump",
    "Sprint Block",
    "No Dash Cooldown",
    "No Ragdoll",
    "Auto Burst",
    "Fly",
    "Auto Soda",
    "Buy Item",
    "Item Grabber",
    "Auto Emote After Kill",
  ],
};

const PREMIUM = {
  "\u{1F48E} Premium Exclusive": [
    "Always Downslam",
    "Auto Aim Abilities",
    "Hitbox Extender",
    "Legit Black Flash Chain",
    "Auto Farm",
    "Invisibility",
    "Invisibility V2",
  ],
};

const KEYLESS_UPDATED = "22/03/2026";
const PREMIUM_UPDATED = "22/03/2026";

function fmt(obj) {
  let out = "";
  for (const [cat, feats] of Object.entries(obj)) {
    out += `\n**${cat}**\n`;
    out += feats.map(f => `> ${f}`).join("\n") + "\n";
  }
  return out.trim();
}

function count(obj) {
  return Object.values(obj).flat().length;
}

function featuresCmd() {
  return reply({
    embeds: [{
      title: "\u2728 Features for Xenon Hub",
      description: "Select a category below to view available features.\nAll features are for **Jujutsu Shenanigans**.",
      color: 0x5865f2,
      fields: [
        { name: "\u{1F513} Keyless", value: `\`${count(KEYLESS)}\` features available`, inline: true },
        { name: "\u{1F48E} Premium", value: `\`${count(PREMIUM)}\` exclusive + all keyless`, inline: true },
      ],
      footer: { text: "Xenon Hub \u2022 Click a button below" },
    }],
    components: [{
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "Premium",
          custom_id: "features_premium",
          emoji: { name: "\u{1F48E}" }
        },
        {
          type: 2,
          style: 1,
          label: "Keyless",
          custom_id: "features_keyless",
          emoji: { name: "\u{1F513}" }
        }
      ]
    }]
  });
}

function handleBtn(id) {
  if (id === "features_premium") {
    return ephemeral({
      embeds: [{
        title: "\u{1F48E} Premium Features",
        description: "**Includes everything in Keyless PLUS:**\n\n" + fmt(PREMIUM),
        color: 0xffd700,
        footer: { text: `${count(PREMIUM)} premium exclusives + all keyless features \u2022 Last Updated: 22 March 2026` },
      }]
    });
  }
  if (id === "features_keyless") {
    return ephemeral({
      embeds: [{
        title: "\u{1F513} Keyless Features",
        description: fmt(KEYLESS),
        color: 0x57f287,
        footer: { text: `${count(KEYLESS)} keyless features \u2022 Updated: ${KEYLESS_UPDATED}` },
      }]
    });
  }
  return null;
}

module.exports = { featuresCmd, handleBtn };
