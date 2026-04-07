const { reply } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");

const EMOJIS = {
  paypal: "<:paypalic:1471187386028261447>",
  seliware: "<:seli:1398716722432704646>",
  booster: "<:booster:1058907673116020857>",
  nitro: "<:nitro:1485509139462357042>",
};

const PURCHASE_CHANNEL = "1284905385190232146";
const BANNER = "https://cdn.discordapp.com/attachments/1469870384231743528/1485301111098179707/standard_4.gif?ex=69c206b4&is=69c0b534&hm=82ee3a0373146c38e8bfee8e7cd34d2ebb8ef7553d740cd89e29759b1e3b5965&";

const DEFAULT_PRICE_TEXT = `[PAYMENT METHODS]
Paypal|\u00A34.99 / 6.80$ - 1 MONTH // \u00A315 / 20.50$ - LIFETIME
Seliware Key|2 MONTHS [ 15$ / 11\u00A3 ] - LIFETIME

[TEMPORARY METHODS]
Server Boosts|NOT ACCEPTED RIGHT NOW!
Nitro (Not Basic)|ONLY WHEN XENON DOESN'T HAVE NITRO - 1 MONTH

[NOTES]
MAKE A TICKET IF YOU WANT TO BE A RESELLER`;

async function getPriceText() {
  return await store.get("priceinfo:raw") || DEFAULT_PRICE_TEXT;
}

function buildDescription(raw) {
  const sections = parseSections(raw);
  const parts = [];

  for (const [section, items] of Object.entries(sections)) {
    if (section === "NOTES") {
      parts.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      parts.push("**NOTES**");
      for (const item of items) {
        parts.push(`\u2022 ${item}`);
      }
      continue;
    }

    if (section.includes("TEMPORARY")) {
      parts.push("***__TEMPORARY METHODS__***\n");
    } else {
      parts.push(`***${section}***\n`);
    }

    for (const item of items) {
      const pipeIdx = item.indexOf("|");
      if (pipeIdx > -1) {
        const label = item.slice(0, pipeIdx).trim();
        const value = item.slice(pipeIdx + 1).trim();
        let emoji = "";
        const lower = label.toLowerCase();
        if (lower.includes("paypal")) emoji = EMOJIS.paypal + " ";
        else if (lower.includes("seliware")) emoji = EMOJIS.seliware + " ";
        else if (lower.includes("boost")) emoji = EMOJIS.booster + " ";
        else if (lower.includes("nitro")) emoji = EMOJIS.nitro + " ";
        parts.push(`${emoji}**${label} -**`);
        parts.push("```");
        parts.push(value.replace(/\s*\/\/\s*/g, "\n"));
        parts.push("```");
      } else {
        parts.push(`\u2022 ${item}`);
      }
    }
    parts.push("");
  }

  return parts.join("\n").trim();
}

async function priceCmd() {
  const raw = await getPriceText();
  const guildId = process.env.GUILD_ID || "0";

  return reply({
    embeds: [{
      title: "Premium Script prices \uD83C\uDF8B",
      color: 0x2b2d31,
      description: buildDescription(raw),
      image: { url: BANNER },
    }],
    components: [{
      type: 1,
      components: [{
        type: 2,
        style: 5,
        label: "Purchase Premium",
        emoji: { name: "\uD83D\uDCB8" },
        url: `https://discord.com/channels/${guildId}/${PURCHASE_CHANNEL}`,
      }]
    }]
  });
}

module.exports = { priceCmd, getPriceText, DEFAULT_PRICE_TEXT };
