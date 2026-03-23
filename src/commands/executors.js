const { reply } = require("../utils/respond");
const store = require("../utils/store");

const DEFAULT_PC_PAID = [
  "SELIWARE - Everything works [ RECOMMENDED ]",
  "VOLT - Everything works",
  "POTASSIUM - Everything works",
  "MACSPLOIT - Most features work [ not frequently tested ]",
  "VOLCANO - Everything works",
  "WAVE - Everything works [ sometimes some stuff is broken ]",
];

const DEFAULT_PC_FREE = [
  "Velocity - Everything works [ RECOMMENDED ]",
  "Bunni.lol - Everything works",
  "Chocosploit - Everything works",
  "Ronix - Partially Supported",
  "Sirhurt - Everything works",
];

const DEFAULT_MOBILE = [
  "Delta - Everything works [ RECOMMENDED ]",
  "Ronix - Everything works",
  "Vega x - Everything works",
  "Cryptic - Everything works",
  "Codex - Partially works [ SOMETIMES BROKEN ]",
];

async function getData() {
  const saved = await store.get("executors");
  if (saved) return typeof saved === "string" ? JSON.parse(saved) : saved;
  return { pc_paid: DEFAULT_PC_PAID, pc_free: DEFAULT_PC_FREE, mobile: DEFAULT_MOBILE };
}

async function getUpdated() {
  return await store.get("executors:updated") || "7 Feb";
}

function fmtList(arr) {
  return arr.map(f => `\u2022 ${f}`).join("\n");
}

async function executorsCmd() {
  const data = await getData();
  const updated = await getUpdated();

  return reply({
    embeds: [
      {
        title: "PC -",
        color: 0x57f287,
        description: [
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
          "PAID ~\n",
          fmtList(data.pc_paid),
          "\nFREE ~\n",
          fmtList(data.pc_free),
          `\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n**Last updated: ${updated}**`,
        ].join("\n"),
      },
      {
        title: "MOBILE -",
        color: 0x5865f2,
        description: [
          "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
          fmtList(data.mobile),
          `\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n**Last updated: ${updated}**`,
        ].join("\n"),
      }
    ]
  });
}

module.exports = { executorsCmd, getData, DEFAULT_PC_PAID, DEFAULT_PC_FREE, DEFAULT_MOBILE };
