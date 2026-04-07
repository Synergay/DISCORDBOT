const fun = require("../commands/fun");
const { featuresCmd } = require("../commands/features");
const { creditsCmd } = require("../commands/credits");
const { setupCmd } = require("../commands/setup");
const { updateCmd } = require("../commands/update");
const { copyCmd } = require("../commands/copy");
const { scriptsCmd } = require("../commands/scripts");
const { execListCmd, updateExecTimestamp } = require("../commands/execlist");
const { viewCmd, addCmd, subCmd, resetCmd } = require("../commands/messages");
const { openKeylessModal, openPriceModal } = require("../commands/editfeatures");
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
  if (funNames.includes(name)) return fun.handle(name, opts, member);

  switch (name) {
    case "features": return featuresCmd();
    case "credits": return creditsCmd();
    case "setup": return await setupCmd(opts, token);
    case "update": return await updateCmd(opts, member);
    case "copy": return await copyCmd(opts, member);
    case "scripts": return scriptsCmd();
    case "executors": return execListCmd();
    case "update-executor": return await updateExecTimestamp(opts);
    case "messages": return await viewCmd(opts, member, guildId);
    case "messageadd": return await addCmd(opts, member, guildId);
    case "messagesub": return await subCmd(opts, member, guildId);
    case "messagereset": return await resetCmd(opts, member, guildId);
    case "updatekeyless": return await openKeylessModal(member);
    case "updateprices": return await openPriceModal(member);
    default: return ephemeral({ content: "unknown command" });
  }
}

module.exports = { handleCmd };
