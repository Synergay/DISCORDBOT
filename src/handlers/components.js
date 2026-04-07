const features = require("../commands/features");
const credits = require("../commands/credits");
const scripts = require("../commands/scripts");
const execlist = require("../commands/execlist");
const updatehub = require("../commands/updatehub");
const authorization = require("../commands/authorization");
const { ephemeral } = require("../utils/respond");

async function handleComponent(data) {
  const id = data.custom_id;
  const values = data.values || [];
  const value = values[0];
  const member = data.member || { user: data.user, roles: [] };

  // ── Script select (from /scripts) ──
  if (id === "script_select" && values.length) {
    return await scripts.handleSelect(values);
  }

  // ── Features buttons (from /features) ──
  if (id.startsWith("features_")) return await features.handleBtn(id);

  // ── Credits buttons ──
  if (id.startsWith("credits_")) return credits.handleBtn(id);

  // ── Executors dropdowns (from /executors) ──
  if (id === "exec_platform_select") {
    return execlist.handlePlatformSelect(value);
  }
  if (id === "exec_category_select") {
    return await execlist.handleCategorySelect(value);
  }

  // ── Update hub main dropdown ──
  if (id === "update_main_select") {
    return await updatehub.handleMainSelect(value, member);
  }

  // ── Update executor sub-dropdown ──
  if (id === "exec_edit_select") {
    return await execlist.handleEditSelect(value);
  }

  // ── Update scripts sub-flows ──
  if (id === "scripts_action_select") {
    return await scripts.handleActionSelect(value);
  }
  if (id === "scripts_remove_select") {
    return await scripts.handleRemoveSelect(value);
  }
  if (id === "scripts_edit_select") {
    return await scripts.handleEditSelect(value);
  }

  // ── Authorization dropdowns ──
  if (id === "auth_action_select") {
    return authorization.handleActionSelect(value);
  }
  if (id === "auth_type_select") {
    return await authorization.handleTypeSelect(value);
  }
  if (id === "auth_deauth_remove") {
    return await authorization.handleDeauthRemove(value);
  }

  return ephemeral({ content: "unknown interaction" });
}

module.exports = { handleComponent };
