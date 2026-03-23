const features = require("../commands/features");
const credits = require("../commands/credits");
const { ephemeral } = require("../utils/respond");

async function handleComponent(data) {
  const id = data.custom_id;

  if (id.startsWith("features_")) return await features.handleBtn(id);
  if (id.startsWith("credits_")) return credits.handleBtn(id);

  return ephemeral({ content: "unknown interaction" });
}

module.exports = { handleComponent };
