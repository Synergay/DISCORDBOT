const { reply, ephemeral } = require("../utils/respond");

const SCRIPTS = {
  sc_bite: 'script_key = "your_script_key_here";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/bf29422a82a6cd50ace6eddc7fab2dd0.lua"))()',
  sc_draw_donate: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/a4e188ac9097019040e697f2130181d3.lua"))()',
  sc_draw_me: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/31a3295e9b7c652d68160166f6f5fdac.lua"))()',
  sc_speed: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/0a51cf48c6f76275f4f624ee6175337a.lua"))()',
  sc_starving1: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/b52a679e87448ee62d5f706d6329e815.lua"))()',
  sc_starving2: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/08c3b60a28a3c884b27ae7d4c66853f3.lua"))()',
  jj_free: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/eed1b8c86a83b71bf7e8ec398fc39401.lua"))()',
  jj_key: 'script_key="";\nloadstring(game:HttpGet("https://api.luarmor.net/files/v3/loaders/eed1b8c86a83b71bf7e8ec398fc39401.lua"))()',
};

function scriptsCmd() {
  return reply({
    content: "### \uD83D\uDCDC Script Selection\nSelect a game below. Mobile users: Long-press the code to copy.",
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 2, label: "Bite by Night", custom_id: "sc_bite" },
          { type: 2, style: 2, label: "Draw and Donate", custom_id: "sc_draw_donate" },
          { type: 2, style: 2, label: "Draw Me", custom_id: "sc_draw_me" },
          { type: 2, style: 2, label: "Speed Draw", custom_id: "sc_speed" },
          { type: 2, style: 2, label: "Starving Artists", custom_id: "sc_starving1" },
        ]
      },
      {
        type: 1,
        components: [
          { type: 2, style: 2, label: "Starving Artists 2", custom_id: "sc_starving2" },
          { type: 2, style: 1, label: "Jujutsu Shenanigans", custom_id: "sc_jujutsu" },
        ]
      }
    ]
  });
}

function handleBtn(id) {
  if (id === "sc_jujutsu") {
    return ephemeral({
      content: "Select version for **Jujutsu Shenanigans**:",
      components: [{
        type: 1,
        components: [
          { type: 2, style: 3, label: "Free", custom_id: "jj_free" },
          { type: 2, style: 4, label: "Key System", custom_id: "jj_key" },
        ]
      }]
    });
  }

  const code = SCRIPTS[id];
  if (code) {
    return ephemeral({ content: `\`\`\`lua\n${code}\n\`\`\`` });
  }

  return null;
}

module.exports = { scriptsCmd, handleBtn, SCRIPTS };
