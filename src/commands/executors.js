const { reply } = require("../utils/respond");
const store = require("../utils/store");
const { parseSections } = require("../utils/sections");

const DEFAULT_EXEC_TEXT = `[PC PAID]
SELIWARE - Everything works [ RECOMMENDED ]
VOLT - Everything works
POTASSIUM - Everything works
MACSPLOIT - Most features work [ not frequently tested ]
VOLCANO - Everything works
WAVE - Everything works [ sometimes some stuff is broken ]

[PC FREE]
Velocity - Everything works [ RECOMMENDED ]
Bunni.lol - Everything works
Chocosploit - Everything works
Ronix - Partially Supported
Sirhurt - Everything works

[MOBILE]
Delta - Everything works [ RECOMMENDED ]
Ronix - Everything works
Vega x - Everything works
Cryptic - Everything works
Codex - Partially works [ SOMETIMES BROKEN ]`;

async function getExecText() {
  return await store.get("executors:raw") || DEFAULT_EXEC_TEXT;
}

async function getUpdated() {
  return await store.get("executors:updated") || "7 Feb";
}

function fmtList(arr) {
  return arr.map(f => `\u2022 ${f}`).join("\n");
}

const COLORS = [0x57f287, 0x5865f2, 0xed4245, 0xfee75c, 0xeb459e, 0xf47b67];

async function executorsCmd() {
  const raw = await getExecText();
  const sections = parseSections(raw);
  const updated = await getUpdated();

  const embeds = [];
  let i = 0;
  for (const [name, items] of Object.entries(sections)) {
    embeds.push({
      title: `${name} -`,
      color: COLORS[i % COLORS.length],
      description: [
        "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
        fmtList(items),
        `\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n**Last updated: ${updated}**`,
      ].join("\n"),
    });
    i++;
  }

  return reply({ embeds });
}

module.exports = { executorsCmd, getExecText, DEFAULT_EXEC_TEXT };
