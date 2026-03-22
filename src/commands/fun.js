const { reply, embed } = require("../utils/respond");

function coinflip() {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  const emoji = result === "Heads" ? "🪙" : "🪙";
  return reply({
    embeds: [embed({
      title: `${emoji} Coinflip`,
      description: `The coin landed on **${result}**!`,
      color: result === "Heads" ? 0xffd700 : 0xc0c0c0
    })]
  });
}

function gaycheck(user) {
  const pct = Math.floor(Math.random() * 101);
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

function femboy(user) {
  const pct = Math.floor(Math.random() * 101);
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

function simpcheck(user) {
  const pct = Math.floor(Math.random() * 101);
  const msg = pct < 30 ? "not a simp, respect 🫡" : pct < 60 ? "lowkey simping" : pct < 85 ? "certified simp 💸" : "TIER 3 SUB SIMP 💀";
  return reply({
    embeds: [embed({
      title: "💸 Simp Checker",
      description: `<@${user.id}> is **${pct}%** simp\n\n${msg}`,
      color: 0xff4444
    })]
  });
}

function rizz(user) {
  const pct = Math.floor(Math.random() * 101);
  const msg = pct < 20 ? "no rizz whatsoever 💀" : pct < 40 ? "awkward rizz" : pct < 60 ? "decent rizz 😏" : pct < 85 ? "W rizz 🗿" : "UNSPOKEN RIZZ GOD 👑";
  return reply({
    embeds: [embed({
      title: "😏 Rizz Meter",
      description: `<@${user.id}> has **${pct}%** rizz\n\n${msg}`,
      color: 0x9b59b6
    })]
  });
}

function pp(user) {
  const size = Math.floor(Math.random() * 13) + 1;
  const visual = "8" + "=".repeat(size) + "D";
  return reply({
    embeds: [embed({
      title: "📏 PP Size Machine",
      description: `<@${user.id}>'s pp:\n\n\`${visual}\`\n\n**${size} inches**`,
      color: 0xe67e22
    })]
  });
}

function iq(user) {
  const score = Math.floor(Math.random() * 200) + 1;
  const msg = score < 50 ? "bro is cooked 💀" : score < 80 ? "below average ngl" : score < 110 ? "average joe" : score < 140 ? "kinda smart 🧠" : "genius level 🤓";
  return reply({
    embeds: [embed({
      title: "🧠 IQ Test",
      description: `<@${user.id}> has an IQ of **${score}**\n\n${msg}`,
      color: 0x3498db
    })]
  });
}

function eightball(question) {
  const answers = [
    "yes, absolutely", "no shot", "maybe, idk", "ask again later",
    "100% yes", "absolutely not", "the stars say yes",
    "nah bro", "without a doubt", "don't count on it",
    "outlook good", "very doubtful", "it is certain",
    "my sources say no", "most likely", "bro what kind of question is that 💀"
  ];
  const ans = answers[Math.floor(Math.random() * answers.length)];
  return reply({
    embeds: [embed({
      title: "🎱 8ball",
      description: `**Q:** ${question}\n**A:** ${ans}`,
      color: 0x1a1a2e
    })]
  });
}

function handle(name, opts, member) {
  const user = member.user;
  const target = opts?.user || user;
  switch (name) {
    case "coinflip": return coinflip();
    case "gaycheck": return gaycheck(target);
    case "femboy": return femboy(target);
    case "simpcheck": return simpcheck(target);
    case "rizz": return rizz(target);
    case "pp": return pp(target);
    case "iq": return iq(target);
    case "8ball": return eightball(opts?.question || "no question?");
    default: return null;
  }
}

module.exports = { handle };
