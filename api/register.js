const commands = [
  { name: "coinflip", description: "Flip a coin" },
  {
    name: "gaycheck",
    description: "Check how gay someone is",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "femboy",
    description: "Femboy tester",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "simpcheck",
    description: "Check how much of a simp someone is",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "rizz",
    description: "Measure someone's rizz",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "pp",
    description: "PP size machine",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "iq",
    description: "IQ test",
    options: [{ name: "user", description: "Target user", type: 6, required: false }]
  },
  {
    name: "8ball",
    description: "Ask the magic 8ball",
    options: [{ name: "question", description: "Your question", type: 3, required: true }]
  },
  { name: "features", description: "View Xenon Hub features" },
  { name: "credits", description: "View bot credits" },
  {
    name: "setup",
    description: "Setup a panel in a channel",
    default_member_permissions: "8",
    options: [
      { name: "channel", description: "Channel to send to", type: 7, required: true },
      {
        name: "function",
        description: "Which panel to send",
        type: 3,
        required: true,
        choices: [
          { name: "Features", value: "features" },
          { name: "Credits", value: "credits" }
        ]
      }
    ]
  },
  {
    name: "update",
    description: "Post an update to the update channel",
    options: [
      { name: "features", description: "Comma separated list of changes", type: 3, required: true },
      { name: "note", description: "Extra note at the bottom", type: 3, required: false }
    ]
  }
];

module.exports = async function handler(req, res) {
  const APP_ID = process.env.DISCORD_APP_ID;
  const TOKEN = process.env.DISCORD_BOT_TOKEN;

  const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${TOKEN}`
    },
    body: JSON.stringify(commands)
  });

  if (r.ok) {
    const data = await r.json();
    return res.json({ success: true, registered: data.length });
  } else {
    const err = await r.text();
    return res.status(500).json({ success: false, error: err });
  }
};
