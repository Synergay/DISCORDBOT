const { reply } = require("../utils/respond");

function executorsCmd() {
  return reply({
    embeds: [
      {
        title: "PC -",
        color: 0x57f287,
        description: [
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
          "PAID ~\n",
          "\u2022 SELIWARE - Everything works [ RECOMMENDED ]",
          "\u2022 VOLT - Everything works",
          "\u2022 POTASSIUM - Everything works",
          "\u2022 MACSPLOIT - Most features work [ not frequently tested ]",
          "\u2022 VOLCANO - Everything works",
          "\u2022 WAVE - Everything works [ sometimes some stuff is broken ]\n",
          "FREE ~\n",
          "\u2022 Velocity - Everything works [ RECOMMENDED ]",
          "\u2022 Bunni.lol - Everything works",
          "\u2022 Chocosploit - Everything works",
          "\u2022 Ronix - Partially Supported",
          "\u2022 Sirhurt - Everything works\n",
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
          "**Last updated: 7 Feb**",
        ].join("\n"),
      },
      {
        title: "MOBILE -",
        color: 0x5865f2,
        description: [
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
          "\u2022 Delta - Everything works [ RECOMMENDED ]",
          "\u2022 Ronix - Everything works",
          "\u2022 Vega x - Everything works",
          "\u2022 Cryptic - Everything works",
          "\u2022 Codex - Partially works [ SOMETIMES BROKEN ]\n",
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
          "**Last updated: 7 Feb**",
        ].join("\n"),
      }
    ]
  });
}

module.exports = { executorsCmd };
