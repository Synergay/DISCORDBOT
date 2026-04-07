const { reply, ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const MAX_COUNT = 2147483647;

function key(guildId, userId) {
  return `msgcount:${guildId}:${userId}`;
}

async function getCount(guildId, userId) {
  const val = await store.get(key(guildId, userId));
  return val ? parseInt(val) : 0;
}

async function setCount(guildId, userId, n) {
  const clamped = Math.max(0, Math.min(MAX_COUNT, n));
  await store.set(key(guildId, userId), String(clamped));
  return clamped;
}

function hasPerm(member) {
  const perms = BigInt(member.permissions || "0");
  const MANAGE_MESSAGES = 1n << 13n;
  const ADMINISTRATOR = 1n << 3n;
  return (perms & MANAGE_MESSAGES) !== 0n || (perms & ADMINISTRATOR) !== 0n;
}

function fmt(n) {
  return n.toLocaleString();
}

async function viewCmd(opts, member, guildId) {
  const target = opts.user || { id: member.user.id, ...member.user };
  const count = await getCount(guildId, target.id);

  return reply({
    embeds: [{
      title: "\uD83D\uDCCA Message Count",
      description: `<@${target.id}> has **${fmt(count)}** tracked messages.`,
      color: 0x5865f2,
      timestamp: new Date().toISOString(),
    }]
  });
}

async function addCmd(opts, member, guildId) {
  if (!hasPerm(member)) {
    return ephemeral({
      embeds: [{
        title: "\uD83D\uDEAB Permission Denied",
        description: "You need **Manage Messages** to use this.",
        color: 0xed4245,
      }]
    });
  }

  const target = opts.user;
  const amount = opts.amount;

  if (target.bot) {
    return ephemeral({
      embeds: [{
        title: "\u274C Invalid Target",
        description: "You cannot track message counts for bots.",
        color: 0xed4245,
      }]
    });
  }

  const before = await getCount(guildId, target.id);
  const after = await setCount(guildId, target.id, before + amount);

  return reply({
    embeds: [{
      title: "\u2795 Messages Added",
      description: `Added **+${fmt(amount)}** to <@${target.id}>'s count.\n\`${fmt(before)}\` \u2192 **\`${fmt(after)}\`**`,
      color: 0x57f287,
      timestamp: new Date().toISOString(),
    }]
  });
}

async function subCmd(opts, member, guildId) {
  if (!hasPerm(member)) {
    return ephemeral({
      embeds: [{
        title: "\uD83D\uDEAB Permission Denied",
        description: "You need **Manage Messages** to use this.",
        color: 0xed4245,
      }]
    });
  }

  const target = opts.user;
  const amount = opts.amount;

  if (target.bot) {
    return ephemeral({
      embeds: [{
        title: "\u274C Invalid Target",
        description: "You cannot track message counts for bots.",
        color: 0xed4245,
      }]
    });
  }

  const before = await getCount(guildId, target.id);
  const after = await setCount(guildId, target.id, before - amount);
  const clamped = after === 0 && before - amount < 0;

  return reply({
    embeds: [{
      title: "\u2796 Messages Subtracted",
      description: `Subtracted **-${fmt(amount)}** from <@${target.id}>'s count.\n\`${fmt(before)}\` \u2192 **\`${fmt(after)}\`**` +
        (clamped ? "\n*(Clamped to 0 \u2014 cannot go negative)*" : ""),
      color: 0xfee75c,
      timestamp: new Date().toISOString(),
    }]
  });
}

async function resetCmd(opts, member, guildId) {
  if (!hasPerm(member)) {
    return ephemeral({
      embeds: [{
        title: "\uD83D\uDEAB Permission Denied",
        description: "You need **Manage Messages** to use this.",
        color: 0xed4245,
      }]
    });
  }

  const target = opts.user;

  if (target.bot) {
    return ephemeral({
      embeds: [{
        title: "\u274C Invalid Target",
        description: "You cannot track message counts for bots.",
        color: 0xed4245,
      }]
    });
  }

  const before = await getCount(guildId, target.id);
  await setCount(guildId, target.id, 0);

  return reply({
    embeds: [{
      title: "\uD83D\uDD04 Count Reset",
      description: `<@${target.id}>'s message count has been reset to **0**.\n*(Was \`${fmt(before)}\`)*`,
      color: 0xed4245,
      timestamp: new Date().toISOString(),
    }]
  });
}

module.exports = { viewCmd, addCmd, subCmd, resetCmd };
