const { reply, ephemeral } = require("../utils/respond");
const store = require("../utils/store");

const DEFAULT_SCRIPTS = [
  { label: "Bite by Night", value: "sc_bite", script: 'script_key = "your_script_key_here";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/bf29422a82a6cd50ace6eddc7fab2dd0.lua"))()' },
  { label: "Draw & Donate", value: "sc_draw_donate", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/a4e188ac9097019040e697f2130181d3.lua"))()' },
  { label: "Draw Me", value: "sc_draw_me", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/31a3295e9b7c652d68160166f6f5fdac.lua"))()' },
  { label: "Speed Draw", value: "sc_speed", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/0a51cf48c6f76275f4f624ee6175337a.lua"))()' },
  { label: "Starving Artists", value: "sc_starving1", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/b52a679e87448ee62d5f706d6329e815.lua"))()' },
  { label: "Starving Artists 2", value: "sc_starving2", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/08c3b60a28a3c884b27ae7d4c66853f3.lua"))()' },
  { label: "Jujutsu Shenanigans (Free)", value: "jj_free", script: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/eed1b8c86a83b71bf7e8ec398fc39401.lua"))()' },
  { label: "Jujutsu Shenanigans (Key)", value: "jj_key", script: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/eed1b8c86a83b71bf7e8ec398fc39401.lua"))()' },
];

async function getScriptOptions() {
  const raw = await store.get("scripts:options");
  if (!raw) return DEFAULT_SCRIPTS;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SCRIPTS;
  } catch {
    return DEFAULT_SCRIPTS;
  }
}

async function saveScriptOptions(options) {
  await store.set("scripts:options", JSON.stringify(options));
}

// ── /scripts command ──

async function scriptsCmd() {
  const options = await getScriptOptions();
  return reply({
    content: "\uD83D\uDCDC **Script Selection**\nSelect a game below.",
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "script_select",
        placeholder: "Select a game...",
        options: options.map(o => ({ label: o.label, value: o.value })),
      }]
    }]
  });
}

async function handleSelect(values) {
  const selected = values[0];
  const options = await getScriptOptions();
  const entry = options.find(o => o.value === selected);
  if (entry) {
    return ephemeral({ content: entry.script });
  }
  return ephemeral({ content: "Script not found." });
}

// ── Update scripts sub-flows (called from updatehub) ──

async function updateScriptsMenu() {
  return ephemeral({
    embeds: [{
      title: "📜 Update Scripts",
      description: "Select an action below.",
      color: 0x5865f2,
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "scripts_action_select",
        placeholder: "Choose action...",
        options: [
          { label: "Add Script", value: "scripts_add", emoji: { name: "➕" } },
          { label: "Remove Script", value: "scripts_remove", emoji: { name: "➖" } },
          { label: "Edit Script", value: "scripts_edit", emoji: { name: "✏️" } },
        ]
      }]
    }]
  });
}

async function handleActionSelect(value) {
  if (value === "scripts_add") {
    return {
      type: 9,
      data: {
        custom_id: "modal_script_add",
        title: "Add Script",
        components: [
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: "script_label",
              label: "Display Name (shown in dropdown)",
              style: 1,
              required: true,
              max_length: 100,
              placeholder: "e.g. My New Game",
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: "script_code",
              label: "Script Code",
              style: 2,
              required: true,
              max_length: 4000,
              placeholder: 'loadstring(game:HttpGet("..."))() ',
            }]
          }
        ]
      }
    };
  }

  const options = await getScriptOptions();
  if (!options.length) {
    return ephemeral({ content: "No scripts to manage." });
  }

  const selectOptions = options.map(o => ({ label: o.label, value: o.value }));

  if (value === "scripts_remove") {
    return ephemeral({
      embeds: [{
        title: "➖ Remove Script",
        description: "Select a script to remove.",
        color: 0xed4245,
      }],
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: "scripts_remove_select",
          placeholder: "Select script to remove...",
          options: selectOptions,
        }]
      }]
    });
  }

  if (value === "scripts_edit") {
    return ephemeral({
      embeds: [{
        title: "✏️ Edit Script",
        description: "Select a script to edit.",
        color: 0xfee75c,
      }],
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: "scripts_edit_select",
          placeholder: "Select script to edit...",
          options: selectOptions,
        }]
      }]
    });
  }

  return null;
}

async function handleRemoveSelect(value) {
  const options = await getScriptOptions();
  const removed = options.find(o => o.value === value);
  const filtered = options.filter(o => o.value !== value);
  await saveScriptOptions(filtered);

  return ephemeral({
    embeds: [{
      title: "✅ Script Removed",
      description: `Removed **${removed?.label || value}** from the scripts list.\n${filtered.length} scripts remaining.`,
      color: 0x57f287,
    }]
  });
}

async function handleEditSelect(value) {
  const options = await getScriptOptions();
  const entry = options.find(o => o.value === value);
  if (!entry) return ephemeral({ content: "Script not found." });

  return {
    type: 9,
    data: {
      custom_id: `modal_script_edit_${value}`,
      title: `Edit: ${entry.label}`.slice(0, 45),
      components: [
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "script_label",
            label: "Display Name",
            style: 1,
            required: true,
            max_length: 100,
            value: entry.label,
          }]
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: "script_code",
            label: "Script Code",
            style: 2,
            required: true,
            max_length: 4000,
            value: entry.script,
          }]
        }
      ]
    }
  };
}

// ── Modal handlers ──

async function handleAddModal(data) {
  const label = data.components[0].components[0].value.trim();
  const script = data.components[1].components[0].value.trim();
  const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 50);

  const options = await getScriptOptions();

  if (options.find(o => o.value === value)) {
    return ephemeral({ content: `A script with key \`${value}\` already exists. Try a different name.` });
  }

  if (options.length >= 25) {
    return ephemeral({ content: "Maximum 25 scripts reached. Remove one first." });
  }

  options.push({ label, value, script });
  await saveScriptOptions(options);

  return ephemeral({
    embeds: [{
      title: "✅ Script Added",
      description: `Added **${label}** (\`${value}\`) to the scripts list.\n${options.length} scripts total.`,
      color: 0x57f287,
    }]
  });
}

async function handleEditModal(data) {
  const match = data.custom_id.match(/^modal_script_edit_(.+)$/);
  if (!match) return null;

  const key = match[1];
  const label = data.components[0].components[0].value.trim();
  const script = data.components[1].components[0].value.trim();

  const options = await getScriptOptions();
  const idx = options.findIndex(o => o.value === key);
  if (idx === -1) return ephemeral({ content: "Script not found." });

  options[idx] = { ...options[idx], label, script };
  await saveScriptOptions(options);

  return ephemeral({
    embeds: [{
      title: "✅ Script Updated",
      description: `Updated **${label}**.`,
      color: 0x57f287,
    }]
  });
}

module.exports = {
  scriptsCmd,
  handleSelect,
  updateScriptsMenu,
  handleActionSelect,
  handleRemoveSelect,
  handleEditSelect,
  handleAddModal,
  handleEditModal,
  getScriptOptions,
};
