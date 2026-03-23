const { reply } = require("../utils/respond");
const store = require("../utils/store");

const EMOJIS = {
  paypal: "<:paypalic:000000000000000000>",
  seliware: "\uD83D\uDCBF",
  booster: "<:booster:000000000000000000>",
  nitro: "<:nitro:000000000000000000>",
};

const PURCHASE_CHANNEL = "1284905385190232146";
const BANNER = "https://cdn.discordapp.com/attachments/1469870384231743528/1485301111098179707/standard_4.gif?ex=69c206b4&is=69c0b534&hm=82ee3a0373146c38e8bfee8e7cd34d2ebb8ef7553d740cd89e29759b1e3b5965&";

const DEFAULT_PRICES = {
  paypal: "\u00A34.99 / 6.80$ - 1 MONTH\n\u00A315 / 20.50$ - LIFETIME",
  seliware: "2 MONTHS [ 15$ / 11\u00A3 ] - LIFETIME",
  boosts: "NOT ACCEPTED RIGHT NOW!",
  nitro: "ONLY WHEN XENON DOESN'T HAVE NITRO - 1 MONTH",
  notes: "MAKE A TICKET IF YOU WANT TO BE A RESELLER",
};

async function getData() {
  const saved = await store.get("priceinfo");
  if (saved) return typeof saved === "string" ? JSON.parse(saved) : saved;
  return DEFAULT_PRICES;
}

async function priceCmd() {
  const data = await getData();
  const guildId = process.env.GUILD_ID || "0";

  return reply({
    embeds: [{
      title: "Premium Script prices \uD83C\uDF8B",
      color: 0x2b2d31,
      description: [
        "***Current payment methods***\n",
        `${EMOJIS.paypal} **Paypal -**`,
        "```",
        data.paypal,
        "```\n",
        `${EMOJIS.seliware} **2 MONTH SELIWARE KEY**`,
        "```",
        data.seliware,
        "```\n",
        "***__TEMPORARY METHODS__***\n",
        `${EMOJIS.booster} **SERVER BOOSTS**`,
        "```",
        data.boosts,
        "```\n",
        `${EMOJIS.nitro} **NITRO (NOT BASIC)**`,
        "```",
        data.nitro,
        "```\n",
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
        "**NOTES**",
        `\u2022 ${data.notes}`,
      ].join("\n"),
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

module.exports = { priceCmd, getData, DEFAULT_PRICES };
