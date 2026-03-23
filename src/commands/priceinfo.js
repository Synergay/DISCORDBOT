const { reply } = require("../utils/respond");

// replace these with your actual emoji IDs
const EMOJIS = {
  paypal: "<:paypalic:000000000000000000>",
  seliware: "\uD83D\uDCBF",
  booster: "<:booster:000000000000000000>",
  nitro: "<:nitro:000000000000000000>",
};

const GUILD_ID = process.env.GUILD_ID || "0";
const PURCHASE_CHANNEL = "1284905385190232146";
const BANNER = "https://cdn.discordapp.com/attachments/1469870384231743528/1485301111098179707/standard_4.gif?ex=69c206b4&is=69c0b534&hm=82ee3a0373146c38e8bfee8e7cd34d2ebb8ef7553d740cd89e29759b1e3b5965&";

function priceCmd() {
  return reply({
    embeds: [{
      title: "Premium Script prices \uD83C\uDF8B",
      color: 0x2b2d31,
      description: [
        "***Current payment methods***\n",
        `${EMOJIS.paypal} **Paypal -**`,
        "```",
        "\u00A34.99 / 6.80$ - 1 MONTH",
        "\u00A315 / 20.50$ - LIFETIME",
        "```\n",
        `${EMOJIS.seliware} **2 MONTH SELIWARE KEY**`,
        "```",
        "2 MONTHS [ 15$ / 11\u00A3 ] - LIFETIME",
        "```\n",
        "***__TEMPORARY METHODS__***\n",
        `${EMOJIS.booster} **SERVER BOOSTS**`,
        "```",
        "NOT ACCEPTED RIGHT NOW!",
        "```\n",
        `${EMOJIS.nitro} **NITRO (NOT BASIC)**`,
        "```",
        "ONLY WHEN XENON DOESN'T HAVE NITRO - 1 MONTH",
        "```\n",
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
        "**NOTES**",
        "\u2022 MAKE A TICKET IF YOU WANT TO BE A RESELLER",
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
        url: `https://discord.com/channels/${GUILD_ID}/${PURCHASE_CHANNEL}`,
      }]
    }]
  });
}

module.exports = { priceCmd };
