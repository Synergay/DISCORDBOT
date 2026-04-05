const features = require("../commands/features");
const credits = require("../commands/credits");
const scripts = require("../commands/scripts");
const execlist = require("../commands/execlist");
const { ephemeral } = require("../utils/respond");

async function handleComponent(data) {
  const id = data.custom_id;

  if (id.startsWith("features_")) return await features.handleBtn(id);
  if (id.startsWith("credits_")) return credits.handleBtn(id);
  if (id.startsWith("sc_") || id.startsWith("jj_")) return scripts.handleBtn(id);
  if (id.startsWith("exec_")) return await execlist.handleBtn(id);

  return ephemeral({ content: "unknown interaction" });
}

module.exports = { handleComponent };
