const fun = require("../commands/fun");
const { infoCmd } = require("../commands/info");
const { publishUpdateCmd } = require("../commands/update");
const { copyCmd } = require("../commands/copy");
const { viewCmd, addCmd, subCmd, resetCmd } = require("../commands/messages");
const { updateCmd } = require("../commands/updatehub");
const { authCmd } = require("../commands/authorization");
const { backfillCmd } = require("../commands/backfill");
const { secretCmd } = require("../commands/secret");
const { ephemeral } = require("../utils/respond");

function parseOpts(data) {
  const opts = {};
  if (!data.options) return opts;
  for (const o of data.options) {
    if (o.type === 6) {
      const resolved = data.resolved?.users?.[o.value];
      opts[o.name] = resolved ? { id: o.value, ...resolved } : { id: o.value };
    } else if (o.type === 7) {
      opts[o.name] = o.value;
    } else {
      opts[o.name] = o.value;
    }
  }
  return opts;
}

async function handleCmd(data, member, token, channelId, guildId) {
  const name = data.name;
  const opts = parseOpts(data);
  opts._channel_id = channelId;

  const funNames = ["coinflip", "gaycheck", "femboy", "simpcheck", "rizz", "pp", "iq", "8ball"];
  if (funNames.includes(name)) return await fun.handle(name, opts, member);

  switch (name) {
    case "info": return infoCmd();
    case "publish-update": return await publishUpdateCmd(opts, member);
    case "copy": return await copyCmd(opts, member);
    case "update": return await updateCmd(member);
    case "authorization": return authCmd(member);
    case "messages": return await viewCmd(opts, member, guildId);
    case "messageadd": return await addCmd(opts, member, guildId);
    case "messagesub": return await subCmd(opts, member, guildId);
    case "messagereset": return await resetCmd(opts, member, guildId);
    case "backfill": return backfillCmd(opts, member);
    case "secret": return await secretCmd(opts, member);
    default: return ephemeral({ content: "unknown command" });
  }
}

module.exports = { handleCmd };
