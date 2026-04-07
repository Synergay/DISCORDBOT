const { reply, embed } = require("../utils/respond");
const store = require("../utils/store");

const BOOSTED_USER = "1051444466235486298";

function isBoosted(user) {
  return user.id === BOOSTED_USER;
}

// ── Rig helpers ──

async function getFunRig(userId) {
  if (userId === BOOSTED_USER) return 0; // Owner can't be rigged on fun
  const val = await store.get(`rig:fun:${userId}`);
  return val ? parseInt(val) : 0;
}

async function get8ballRig(userId) {
  const val = await store.get(`rig:8ball:${userId}`);
  return val ? parseInt(val) : 0;
}

async function getCoinflipRig(userId) {
  const raw = await store.get(`rig:coinflip:${userId}`);
  if (!raw) return null;
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!data || !data.result || !data.count) return null;
    return data;
  } catch {
    return null;
  }
}

async function decrementCoinflipRig(userId) {
  const rig = await getCoinflipRig(userId);
  if (!rig) return;
  rig.count--;
  if (rig.count <= 0) {
    await store.set(`rig:coinflip:${userId}`, "");
  } else {
    await store.set(`rig:coinflip:${userId}`, JSON.stringify(rig));
  }
}

// Bias a "high = bad" value (gaycheck, simpcheck, femboy)
function rigHighBad(severity) {
  const ranges = {
    1: [50, 70],
    2: [60, 80],
    3: [70, 90],
    4: [80, 95],
    5: [90, 100],
    6: [100, 100],
  };
  const [min, max] = ranges[severity] || [0, 100];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Bias a "low = bad" value (rizz, iq)
function rigLowBad(severity, floor = 0, ceil = 100) {
  const ranges = {
    1: [30, 50],
    2: [20, 40],
    3: [10, 30],
    4: [5, 15],
    5: [1, 5],
    6: [floor, floor],
  };
  const pctRange = ranges[severity] || [0, 100];
  const min = Math.floor(ceil * pctRange[0] / 100);
  const max = Math.floor(ceil * pctRange[1] / 100);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Bias pp (low = bad)
function rigPpBad(severity) {
  const ranges = {
    1: [3, 6],
    2: [2, 5],
    3: [1, 4],
    4: [1, 3],
    5: [1, 2],
    6: [1, 1],
  };
  const [min, max] = ranges[severity] || [1, 13];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Fun commands ──

async function coinflip(user) {
  const rig = await getCoinflipRig(user.id);
  let result;
  if (rig) {
    result = rig.result === 1 ? "Heads" : "Tails";
    await decrementCoinflipRig(user.id);
  } else {
    result = Math.random() < 0.5 ? "Heads" : "Tails";
  }
  return reply({
    embeds: [embed({
      title: "🪙 Coinflip",
      description: `The coin landed on **${result}**!`,
      color: result === "Heads" ? 0xffd700 : 0xc0c0c0
    })]
  });
}

async function gaycheck(user) {
  const rig = await getFunRig(user.id);
  let pct;
  if (rig > 0) {
    pct = rigHighBad(rig);
  } else if (isBoosted(user)) {
    pct = Math.floor(Math.random() * 6); // 0-5%
  } else {
    pct = Math.floor(Math.random() * 101);
  }
  const bar = "🟪".repeat(Math.floor(pct / 10)) + "⬛".repeat(10 - Math.floor(pct / 10));
  let verdict = pct < 20 ? "straight as a ruler" : pct < 50 ? "a little fruity" : pct < 80 ? "pretty gay ngl" : "GAY ASF 🏳️‍🌈";
  return reply({
    embeds: [embed({
      title: "🏳️‍🌈 Gay Checker",
      description: `<@${user.id}> is **${pct}%** gay\n${bar}\n\nverdict: **${verdict}**`,
      color: 0xff69b4
    })]
  });
}

async function femboy(user) {
  const rig = await getFunRig(user.id);
  let pct;
  if (rig > 0) {
    pct = rigHighBad(rig);
  } else if (isBoosted(user)) {
    pct = Math.floor(Math.random() * 11); // 0-10%
  } else {
    pct = Math.floor(Math.random() * 101);
  }
  const ratings = [
    { min: 0, max: 20, msg: "not femboy material 😔" },
    { min: 21, max: 40, msg: "slight femboy tendencies" },
    { min: 41, max: 60, msg: "mid femboy 🤔" },
    { min: 61, max: 80, msg: "certified femboy ✨" },
    { min: 81, max: 100, msg: "MEGA FEMBOY 💅🎀" }
  ];
  const r = ratings.find(r => pct >= r.min && pct <= r.max);
  return reply({
    embeds: [embed({
      title: "🎀 Femboy Tester",
      description: `<@${user.id}> scored **${pct}%** on the femboy scale\n\n${r.msg}`,
      color: 0xffb6c1
    })]
  });
}

async function simpcheck(user) {
  const rig = await getFunRig(user.id);
  let pct;
  if (rig > 0) {
    pct = rigHighBad(rig);
  } else if (isBoosted(user)) {
    pct = Math.floor(Math.random() * 6); // 0-5%
  } else {
    pct = Math.floor(Math.random() * 101);
  }
  const msg = pct < 30 ? "not a simp, respect 🫡" : pct < 60 ? "lowkey simping" : pct < 85 ? "certified simp 💸" : "TIER 3 SUB SIMP 💀";
  return reply({
    embeds: [embed({
      title: "💸 Simp Checker",
      description: `<@${user.id}> is **${pct}%** simp\n\n${msg}`,
      color: 0xff4444
    })]
  });
}

async function rizz(user) {
  const rig = await getFunRig(user.id);
  let pct;
  if (rig > 0) {
    pct = rigLowBad(rig);
  } else if (isBoosted(user)) {
    pct = Math.floor(Math.random() * 16) + 85; // 85-100%
  } else {
    pct = Math.floor(Math.random() * 101);
  }
  const msg = pct < 20 ? "no rizz whatsoever 💀" : pct < 40 ? "awkward rizz" : pct < 60 ? "decent rizz 😏" : pct < 85 ? "W rizz 🗿" : "UNSPOKEN RIZZ GOD 👑";
  return reply({
    embeds: [embed({
      title: "😏 Rizz Meter",
      description: `<@${user.id}> has **${pct}%** rizz\n\n${msg}`,
      color: 0x9b59b6
    })]
  });
}

async function pp(user) {
  const rig = await getFunRig(user.id);
  let size;
  if (rig > 0) {
    size = rigPpBad(rig);
  } else if (isBoosted(user)) {
    size = Math.floor(Math.random() * 4) + 10; // 10-13 inches
  } else {
    size = Math.floor(Math.random() * 13) + 1;
  }
  const visual = "8" + "=".repeat(size) + "D";
  return reply({
    embeds: [embed({
      title: "📏 PP Size Machine",
      description: `<@${user.id}>'s pp:\n\n\`${visual}\`\n\n**${size} inches**`,
      color: 0xe67e22
    })]
  });
}

async function iq(user) {
  const rig = await getFunRig(user.id);
  let score;
  if (rig > 0) {
    score = rigLowBad(rig, 1, 200);
  } else if (isBoosted(user)) {
    score = Math.floor(Math.random() * 26) + 175; // 175-200
  } else {
    score = Math.floor(Math.random() * 200) + 1;
  }
  const msg = score < 50 ? "bro is cooked 💀" : score < 80 ? "below average ngl" : score < 110 ? "average joe" : score < 140 ? "kinda smart 🧠" : "genius level 🤓";
  return reply({
    embeds: [embed({
      title: "🧠 IQ Test",
      description: `<@${user.id}> has an IQ of **${score}**\n\n${msg}`,
      color: 0x3498db
    })]
  });
}

async function eightball(question, user) {
  const positiveAnswers = [
    "yes, absolutely", "100% yes", "the stars say yes",
    "without a doubt", "outlook good", "it is certain", "most likely"
  ];
  const negativeAnswers = [
    "no shot", "absolutely not", "nah bro",
    "don't count on it", "very doubtful", "my sources say no"
  ];
  const neutralAnswers = [
    "maybe, idk", "ask again later",
    "bro what kind of question is that 💀"
  ];

  const allAnswers = [...positiveAnswers, ...negativeAnswers, ...neutralAnswers];

  const rig = await get8ballRig(user.id);
  let ans;

  if (rig > 0) {
    switch (rig) {
      case 1: // Always positive
        ans = positiveAnswers[Math.floor(Math.random() * positiveAnswers.length)];
        break;
      case 2: // 80% positive
        ans = Math.random() < 0.8
          ? positiveAnswers[Math.floor(Math.random() * positiveAnswers.length)]
          : allAnswers[Math.floor(Math.random() * allAnswers.length)];
        break;
      case 3: // 60% positive
        ans = Math.random() < 0.6
          ? positiveAnswers[Math.floor(Math.random() * positiveAnswers.length)]
          : allAnswers[Math.floor(Math.random() * allAnswers.length)];
        break;
      case 4: // 60% negative
        ans = Math.random() < 0.6
          ? negativeAnswers[Math.floor(Math.random() * negativeAnswers.length)]
          : allAnswers[Math.floor(Math.random() * allAnswers.length)];
        break;
      case 5: // 80% negative
        ans = Math.random() < 0.8
          ? negativeAnswers[Math.floor(Math.random() * negativeAnswers.length)]
          : allAnswers[Math.floor(Math.random() * allAnswers.length)];
        break;
      case 6: // Always negative
        ans = negativeAnswers[Math.floor(Math.random() * negativeAnswers.length)];
        break;
      default:
        ans = allAnswers[Math.floor(Math.random() * allAnswers.length)];
    }
  } else {
    ans = allAnswers[Math.floor(Math.random() * allAnswers.length)];
  }

  return reply({
    embeds: [embed({
      title: "🎱 8ball",
      description: `**Q:** ${question}\n**A:** ${ans}`,
      color: 0x1a1a2e
    })]
  });
}

async function handle(name, opts, member) {
  const user = member.user;
  const target = opts?.user || user;
  switch (name) {
    case "coinflip": return await coinflip(target);
    case "gaycheck": return await gaycheck(target);
    case "femboy": return await femboy(target);
    case "simpcheck": return await simpcheck(target);
    case "rizz": return await rizz(target);
    case "pp": return await pp(target);
    case "iq": return await iq(target);
    case "8ball": return await eightball(opts?.question || "no question?", target);
    default: return null;
  }
}

module.exports = { handle };
