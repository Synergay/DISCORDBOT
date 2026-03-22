const fun = require("../commands/fun");
const { featuresCmd } = require("../commands/features");
const { creditsCmd } = require("../commands/credits");
const { setupCmd } = require("../commands/setup");
const { updateCmd } = require("../commands/update");
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

async function handleCmd(data, member, token) {
  const name = data.name;
  const opts = parseOpts(data);

  const funNames = ["coinflip", "gaycheck", "femboy", "simpcheck", "rizz", "pp", "iq", "8ball"];
  if (funNames.includes(name)) return fun.handle(name, opts, member);

  switch (name) {
    case "features": return featuresCmd();
    case "credits": return creditsCmd();
    case "setup": return await setupCmd(opts, token);
    case "update": return await updateCmd(opts, member);
    default: return ephemeral({ content: "unknown command" });
  }
}

module.exports = { handleCmd };
