const { ephemeral } = require("../utils/respond");
const { checkAuth, notAuthorized, OWNER_ID } = require("./authorization");

// ── /update command ──

async function updateCmd(member) {
  const userId = member.user?.id || member.id;

  // Owner always has access — for others, we check type-level auth later
  // But first we do a quick "has ANY auth" check so completely unauthorized users get denied
  if (userId !== OWNER_ID) {
    const types = ["upd_executor", "upd_keyless", "upd_premium", "upd_prices", "upd_scripts"];
    let hasAny = false;
    for (const t of types) {
      if (await checkAuth(member, t)) { hasAny = true; break; }
    }
    if (!hasAny) return notAuthorized();
  }

  return ephemeral({
    embeds: [{
      title: "🔧 Update Hub",
      description: "Select what you want to update.",
      color: 0x5865f2,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "update_main_select",
        placeholder: "Choose update type...",
        options: [
          { label: "Update Executor", value: "upd_executor", emoji: { name: "🎮" }, description: "Edit executor compatibility lists" },
          { label: "Update Keyless", value: "upd_keyless", emoji: { name: "🔓" }, description: "Edit keyless features list" },
          { label: "Update Premium", value: "upd_premium", emoji: { name: "💎" }, description: "Edit premium features list" },
          { label: "Update Prices", value: "upd_prices", emoji: { name: "💰" }, description: "Edit premium pricing message" },
          { label: "Update Scripts", value: "upd_scripts", emoji: { name: "📜" }, description: "Add/remove/edit script options" },
        ]
      }]
    }]
  });
}

// ── Route dropdown selection to sub-flows ──

async function handleMainSelect(value, member) {
  // Per-type auth check
  if (!await checkAuth(member, value)) {
    return notAuthorized();
  }

  switch (value) {
    case "upd_executor": {
      const { updateExecMenu } = require("./execlist");
      return updateExecMenu();
    }
    case "upd_keyless": {
      const { openKeylessModal } = require("./editfeatures");
      return await openKeylessModal();
    }
    case "upd_premium": {
      const { openPremiumFeaturesModal } = require("./editfeatures");
      return await openPremiumFeaturesModal();
    }
    case "upd_prices": {
      const { openPricesModal } = require("./editfeatures");
      return await openPricesModal();
    }
    case "upd_scripts": {
      const { updateScriptsMenu } = require("./scripts");
      return await updateScriptsMenu();
    }
    default:
      return ephemeral({ content: "Unknown update type." });
  }
}

module.exports = { updateCmd, handleMainSelect };
