const fun = require("../commands/fun");
const { featuresCmd } = require("../commands/features");
const { creditsCmd } = require("../commands/credits");
const { setupCmd } = require("../commands/setup");
const { publishUpdateCmd } = require("../commands/update");
const { copyCmd } = require("../commands/copy");
const { scriptsCmd } = require("../commands/scripts");
const { execListCmd } = require("../commands/execlist");
const { viewCmd, addCmd, subCmd, resetCmd } = require("../commands/messages");
const { updateCmd } = require("../commands/updatehub");
const { authCmd } = require("../commands/authorization");
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
    case "publish-update": return await publishUpdateCmd(opts, member);
    case "copy": return await copyCmd(opts, member);
    case "scripts": return await scriptsCmd();
    case "executors": return execListCmd();
    case "update": return await updateCmd(member);
    case "authorization": return authCmd(member);
    case "messages": return await viewCmd(opts, member, guildId);
    case "messageadd": return await addCmd(opts, member, guildId);
    case "messagesub": return await subCmd(opts, member, guildId);
    case "messagereset": return await resetCmd(opts, member, guildId);
    default: return ephemeral({ content: "unknown command" });
  }
}

module.exports = { handleCmd };
