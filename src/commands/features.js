const { reply, ephemeral } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");

const DEFAULT_KEYLESS_TEXT = `[\u2694\uFE0F Combat]
Auto Block
Auto Counter
Punish After Block
Punish After Dash
Side Dash Assist
Always Uppercut
Legit Auto Downslam
Legit Auto Uppercut
Anti Domain
Legit Block Break
Force Method
TP Block
TP To Player
Auto Black Flash
Auto Feint Black Flash

[\u{1F9EC} Character Abilities]
Auto WCS (Yuji Awk)
Auto Feint (Yuji)
Auto Execution (Higurama)
Auto Perfect Clap (Todo)
Auto R Variant (Todo)
Auto R Hit (Todo)
Auto Copy (Yuta)
Auto Adapt (Mahoraga)
Safe Summon Mahoraga
Auto Higurama QTE
Auto Higurama Domain
Replace Jackpot Music (Hakari)
Naoya Tech (Naoya)
M1 Dodge (Haruta)
Auto Backstab (Haruta)
Auto Fly Frog Variant (Megumi)
Auto Shadow Variant (Megumi)
Garuda Special (Yuki)
Rising Rage Special (Yuki)
Mass Breaker Special (Yuki)
Garuda Stab Special (Yuki)
Auto Ult (Yuki)
Auto Ratio (Salaryman)

[\u{1F4DD} Tools]
Advanced Auto Combo Maker

[\u{1F441}\uFE0F ESP & Tracking]
Box ESP
Name ESP
Health ESP
Distance ESP
Character ESP
Tracer ESP
CD Revealer
Item ESP
Character Lock On
Camera Lock On
TBO/JJS Lock On

[\u{1F3AE} Player]
Spoof Username & Avatar
No Stun
Legit No Stun
No Jump
Sprint Block
No Dash Cooldown
No Ragdoll
Auto Burst
Fly
Auto Soda
Buy Item
Item Grabber
Auto Emote After Kill`;

const DEFAULT_PREMIUM_TEXT = `Always Downslam
Auto Aim Abilities
Hitbox Extender
Legit Black Flash Chain
Auto Farm
Invisibility
Invisibility V2`;

async function getKeylessText() {
  return await store.get("features:keyless:raw") || DEFAULT_KEYLESS_TEXT;
}

async function getPremiumText() {
  return await store.get("features:premium:raw") || DEFAULT_PREMIUM_TEXT;
}

async function getUpdated(type) {
  return await store.get(`features:${type}:updated`) || "22 March 2026";
}

function fmtSections(sections) {
  let out = "";
  for (const [cat, feats] of Object.entries(sections)) {
    out += `\n**${cat}**\n`;
    out += feats.map(f => `> ${f}`).join("\n") + "\n";
  }
  return out.trim();
}

function countAll(sections) {
  return Object.values(sections).flat().length;
}

function featuresCmd() {
  return reply({
    embeds: [{
      title: "\u2728 Features for Xenon Hub",
      description: "Select a category below to view available features.\nAll features are for **Jujutsu Shenanigans**.",
      color: 0x5865f2,
      footer: { text: "Xenon Hub \u2022 Click a button below" },
    }],
    components: [{
      type: 1,
      components: [
        { type: 2, style: 3, label: "Premium", custom_id: "features_premium", emoji: { name: "\u{1F48E}" } },
        { type: 2, style: 1, label: "Keyless", custom_id: "features_keyless", emoji: { name: "\u{1F513}" } }
      ]
    }]
  });
}

async function handleBtn(id) {
  if (id === "features_premium") {
    const raw = await getPremiumText();
    const feats = raw.split("\n").map(f => f.trim()).filter(Boolean);
    const updated = await getUpdated("premium");
    return ephemeral({
      embeds: [{
        title: "\u{1F48E} Premium Features",
        description: "**Includes everything in Keyless PLUS:**\n\n" + feats.map(f => `> ${f}`).join("\n"),
        color: 0xffd700,
        footer: { text: `${feats.length} premium exclusives + all keyless features \u2022 Last Updated: ${updated}` },
      }]
    });
  }
  if (id === "features_keyless") {
    const raw = await getKeylessText();
    const sections = parseSections(raw);
    const updated = await getUpdated("keyless");
    return ephemeral({
      embeds: [{
        title: "\u{1F513} Keyless Features",
        description: fmtSections(sections),
        color: 0x57f287,
        footer: { text: `${countAll(sections)} keyless features \u2022 Last Updated: ${updated}` },
      }]
    });
  }
  return null;
}

module.exports = { featuresCmd, handleBtn, getKeylessText, getPremiumText, DEFAULT_KEYLESS_TEXT, DEFAULT_PREMIUM_TEXT };
