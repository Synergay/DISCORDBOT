const features = require("../commands/features");
const credits = require("../commands/credits");
const scripts = require("../commands/scripts");
const execlist = require("../commands/execlist");
const updatehub = require("../commands/updatehub");
const authorization = require("../commands/authorization");
const info = require("../commands/info");
const ticket = require("../commands/ticket");
const { ephemeral } = require("../utils/respond");

async function handleComponent(data) {
  const id = data.custom_id;
  const values = data.values || [];
  const value = values[0];
  const member = data.member || { user: data.user, roles: [] };

  // ── Info main dropdown (from /info) ──
  if (id === "info_main_select" && values.length) {
    return await info.handleInfoSelect(value);
  }

  // ── Script select (from /info → Scripts) ──
  if (id === "script_select" && values.length) {
    return await scripts.handleSelect(values);
  }

  // ── Features buttons (from /info → Features) ──
  if (id.startsWith("features_")) return await features.handleBtn(id);

  // ── Credits buttons ──
  if (id.startsWith("credits_")) return credits.handleBtn(id);

  // ── Executors category dropdown (from /info → Executors, single dropdown) ──
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

  // ── Ticket toggle buttons ──
  if (id.startsWith("ticket_toggle_")) {
    const num = parseInt(id.replace("ticket_toggle_", ""));
    if (num >= 1 && num <= 5) {
      return await ticket.handleTicketToggle(num);
    }
  }

  // ── Ticket msg threshold button ──
  if (id === "ticket_edit_threshold") {
    return ticket.handleThresholdBtn();
  }

  return ephemeral({ content: "unknown interaction" });
}

module.exports = { handleComponent };
