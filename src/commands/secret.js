const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const OWNER_ID = "1051444466235486298";

// ── /secret command ──

async function secretCmd(opts, member) {
  const userId = member.user?.id || member.id;
  if (userId !== OWNER_ID) {
    return ephemeral({ content: "Unknown command." });
  }

  const type = opts.type;
  const target = opts.user;
  const severity = opts.severity;
  const count = opts.count || 1;

  if (!target || target.id === undefined) {
    return ephemeral({ content: "❌ You must specify a target user." });
  }

  // Type 1 — Rig fun commands (owner cannot be targeted)
  if (type === 1) {
    if (target.id === OWNER_ID) {
      return ephemeral({
        embeds: [{
          title: "❌ Cannot Rig Owner",
          description: "Owner is already boosted on fun commands — cannot rig.",
          color: 0xed4245,
        }]
      });
    }

    if (severity === 0) {
      await store.set(`rig:fun:${target.id}`, "");
      return ephemeral({
        embeds: [{
          title: "🔓 Rig Removed",
          description: `Removed fun rig from <@${target.id}>.`,
          color: 0x57f287,
        }]
      });
    }

    await store.set(`rig:fun:${target.id}`, String(severity));
    return ephemeral({
      embeds: [{
        title: "🎯 Fun Rig Set",
        description: `<@${target.id}> is now rigged on fun commands.\n**Severity:** ${severity}/6 ${severity === 6 ? "(ALWAYS WORST)" : ""}\n\nAffects: gaycheck, femboy, simpcheck, rizz, pp, iq`,
        color: 0xed4245,
      }]
    });
  }

  // Type 2 — Rig 8ball (owner CAN be targeted)
  if (type === 2) {
    if (severity === 0) {
      await store.set(`rig:8ball:${target.id}`, "");
      return ephemeral({
        embeds: [{
          title: "🔓 Rig Removed",
          description: `Removed 8ball rig from <@${target.id}>.`,
          color: 0x57f287,
        }]
      });
    }

    const biasLabels = {
      1: "Always positive (stars say yes)",
      2: "Mostly positive (80%)",
      3: "Slightly positive (60%)",
      4: "Slightly negative (60%)",
      5: "Mostly negative (80%)",
      6: "Always negative (absolutely not)",
    };

    await store.set(`rig:8ball:${target.id}`, String(severity));
    return ephemeral({
      embeds: [{
        title: "🎱 8ball Rig Set",
        description: `<@${target.id}> is now rigged on 8ball.\n**Severity:** ${severity}/6\n**Bias:** ${biasLabels[severity]}`,
        color: 0x1a1a2e,
      }]
    });
  }

  // Type 3 — Rig coinflip (owner CAN be targeted)
  if (type === 3) {
    if (severity === 0) {
      await store.set(`rig:coinflip:${target.id}`, "");
      return ephemeral({
        embeds: [{
          title: "🔓 Rig Removed",
          description: `Removed coinflip rig from <@${target.id}>.`,
          color: 0x57f287,
        }]
      });
    }

    // severity = 1 (heads) or 2 (tails)
    const resultName = severity === 1 ? "Heads" : "Tails";
    const rigData = JSON.stringify({ result: severity, count });
    await store.set(`rig:coinflip:${target.id}`, rigData);
    return ephemeral({
      embeds: [{
        title: "🪙 Coinflip Rig Set",
        description: `<@${target.id}> will land **${resultName}** for the next **${count}** flip(s).`,
        color: 0xffd700,
      }]
    });
  }

  return ephemeral({ content: "Invalid rig type." });
}

module.exports = { secretCmd };
