const { ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const OWNER_ID = "1051444466235486298";

const UPDATE_TYPES = {
  upd_executor: "Update Executor",
  upd_keyless: "Update Keyless",
  upd_premium: "Update Premium",
  upd_prices: "Update Prices",
  upd_scripts: "Update Scripts",
};

// ── Redis helpers ──

async function getAuth(type) {
  const raw = await store.get(`auth:${type}`);
  if (!raw) return { users: [], roles: [] };
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { users: [], roles: [] };
  }
}

async function saveAuth(type, data) {
  await store.set(`auth:${type}`, JSON.stringify(data));
}

async function addAuth(type, userId, roleId) {
  const data = await getAuth(type);
  if (userId && !data.users.includes(userId)) data.users.push(userId);
  if (roleId && !data.roles.includes(roleId)) data.roles.push(roleId);
  await saveAuth(type, data);
  return data;
}

async function removeAuth(type, id) {
  const data = await getAuth(type);
  data.users = data.users.filter(u => u !== id);
  data.roles = data.roles.filter(r => r !== id);
  await saveAuth(type, data);
  return data;
}

// ── Auth check (used by updatehub) ──

async function checkAuth(member, type) {
  const userId = member.user?.id || member.id;
  if (userId === OWNER_ID) return true;

  const data = await getAuth(type);
  if (data.users.includes(userId)) return true;

  const memberRoles = member.roles || [];
  if (memberRoles.some(r => data.roles.includes(r))) return true;

  return false;
}

function notAuthorized() {
  return ephemeral({
    embeds: [{
      title: "🚫 Not Authorized",
      description: `Not Authorized! ask <@${OWNER_ID}> to authorize you.`,
      color: 0xed4245,
    }]
  });
}

// ── /authorization command ──

function authCmd(member) {
  const userId = member.user?.id || member.id;
  if (userId !== OWNER_ID) {
    return ephemeral({ content: "Only the owner can use this command." });
  }

  return ephemeral({
    embeds: [{
      title: "🔐 Authorization Manager",
      description: "Select an action below.",
      color: 0x5865f2,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "auth_action_select",
        placeholder: "Choose action...",
        options: [
          { label: "Authorize", value: "authorize", emoji: { name: "✅" }, description: "Grant access to an update type" },
          { label: "Deauthorize", value: "deauthorize", emoji: { name: "❌" }, description: "Revoke access from an update type" },
        ]
      }]
    }]
  });
}

// ── Component handlers ──

function handleActionSelect(value) {
  const typeOptions = Object.entries(UPDATE_TYPES).map(([val, label]) => ({
    label, value: `${value}_${val}`,
  }));

  return ephemeral({
    embeds: [{
      title: value === "authorize" ? "✅ Authorize" : "❌ Deauthorize",
      description: "Which update type?",
      color: value === "authorize" ? 0x57f287 : 0xed4245,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "auth_type_select",
        placeholder: "Select update type...",
        options: typeOptions,
      }]
    }]
  });
}

async function handleTypeSelect(value) {
  const isAuth = value.startsWith("authorize_");
  const type = value.replace(/^(authorize|deauthorize)_/, "");

  if (isAuth) {
    return {
      type: 9,
      data: {
        custom_id: `modal_auth_add_${type}`,
        title: `Authorize — ${UPDATE_TYPES[type]}`,
        components: [
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: "auth_user_id",
              label: "User ID (optional if Role ID given)",
              style: 1,
              required: false,
              max_length: 25,
              placeholder: "e.g. 123456789012345678",
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: "auth_role_id",
              label: "Role ID (optional)",
              style: 1,
              required: false,
              max_length: 25,
              placeholder: "e.g. 987654321098765432",
            }]
          }
        ]
      }
    };
  }

  // Deauthorize → show current entries
  const data = await getAuth(type);
  const entries = [];
  for (const u of data.users) entries.push({ label: `User: ${u}`, value: `deauth_${type}_user_${u}`, emoji: { name: "👤" } });
  for (const r of data.roles) entries.push({ label: `Role: ${r}`, value: `deauth_${type}_role_${r}`, emoji: { name: "🎭" } });

  if (!entries.length) {
    return ephemeral({
      embeds: [{
        title: `❌ Deauthorize — ${UPDATE_TYPES[type]}`,
        description: "No authorized users or roles for this type.",
        color: 0xfee75c,
      }]
    });
  }

  const lines = [];
  if (data.users.length) lines.push("**Users:**\n" + data.users.map(u => `• <@${u}> (\`${u}\`)`).join("\n"));
  if (data.roles.length) lines.push("**Roles:**\n" + data.roles.map(r => `• <@&${r}> (\`${r}\`)`).join("\n"));

  return ephemeral({
    embeds: [{
      title: `❌ Deauthorize — ${UPDATE_TYPES[type]}`,
      description: lines.join("\n\n") + "\n\nSelect an entry below to remove it.",
      color: 0xed4245,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "auth_deauth_remove",
        placeholder: "Select to remove...",
        options: entries,
      }]
    }]
  });
}

async function handleDeauthRemove(value) {
  // value = deauth_upd_executor_user_123456
  const match = value.match(/^deauth_(upd_\w+)_(user|role)_(.+)$/);
  if (!match) return ephemeral({ content: "Invalid selection." });

  const [, type, kind, id] = match;
  await removeAuth(type, id);

  return ephemeral({
    embeds: [{
      title: "✅ Removed",
      description: `Removed ${kind} \`${id}\` from **${UPDATE_TYPES[type]}** authorization.`,
      color: 0x57f287,
    }]
  });
}

async function handleAuthModal(data) {
  const typeMatch = data.custom_id.match(/^modal_auth_add_(.+)$/);
  if (!typeMatch) return null;

  const type = typeMatch[1];
  const userId = data.components[0]?.components[0]?.value?.trim() || "";
  const roleId = data.components[1]?.components[0]?.value?.trim() || "";

  if (!userId && !roleId) {
    return ephemeral({ content: "You must provide at least a User ID or Role ID." });
  }

  const result = await addAuth(type, userId || null, roleId || null);
  const parts = [];
  if (userId) parts.push(`User: \`${userId}\``);
  if (roleId) parts.push(`Role: \`${roleId}\``);

  return ephemeral({
    embeds: [{
      title: "✅ Authorized",
      description: `Added ${parts.join(" & ")} to **${UPDATE_TYPES[type]}**.\n\nCurrent authorized:\n• Users: ${result.users.length}\n• Roles: ${result.roles.length}`,
      color: 0x57f287,
    }]
  });
}

module.exports = {
  OWNER_ID,
  UPDATE_TYPES,
  authCmd,
  checkAuth,
  notAuthorized,
  handleActionSelect,
  handleTypeSelect,
  handleDeauthRemove,
  handleAuthModal,
};
