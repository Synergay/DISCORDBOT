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
  {
    name: "info",
    description: "View bot features, executors, scripts, and credits"
  },
  {
    name: "messages",
    description: "View tracked message count for a user",
    options: [{ name: "user", description: "User to check (defaults to you)", type: 6, required: false }]
  },
  {
    name: "messageadd",
    description: "Add to a user's message count",
    default_member_permissions: "8192",
    options: [
      { name: "user", description: "Target user", type: 6, required: true },
      { name: "amount", description: "Amount to add (1-1000000)", type: 4, required: true, min_value: 1, max_value: 1000000 }
    ]
  },
  {
    name: "messagesub",
    description: "Subtract from a user's message count",
    default_member_permissions: "8192",
    options: [
      { name: "user", description: "Target user", type: 6, required: true },
      { name: "amount", description: "Amount to subtract (1-1000000)", type: 4, required: true, min_value: 1, max_value: 1000000 }
    ]
  },
  {
    name: "messagereset",
    description: "Reset a user's message count to 0",
    default_member_permissions: "8192",
    options: [{ name: "user", description: "Target user", type: 6, required: true }]
  },
  {
    name: "publish-update",
    description: "Post an update to the update channel",
    options: [
      { name: "features", description: "Comma separated list of changes", type: 3, required: true },
      { name: "note", description: "Extra note at the bottom", type: 3, required: false }
    ]
  },
  {
    name: "copy",
    description: "Copy a message (embed + buttons) to another channel",
    default_member_permissions: "8",
    options: [
      { name: "message_id", description: "Message ID to copy", type: 3, required: true },
      { name: "source", description: "Source channel (defaults to current)", type: 7, required: false },
      { name: "target", description: "Target channel (defaults to current)", type: 7, required: false }
    ]
  },
  {
    name: "update",
    description: "Edit bot content (executor lists, features, scripts, prices, tickets)"
  },
  {
    name: "authorization",
    description: "Manage who can use /update (owner only)"
  },
  {
    name: "backfill",
    description: "Scan messages and backfill message counts",
    default_member_permissions: "8192",
    options: [
      {
        name: "target",
        description: "What to scan",
        type: 3,
        required: true,
        choices: [
          { name: "Current channel only", value: "channel" },
          { name: "All text channels", value: "all" }
        ]
      },
      {
        name: "mode",
        description: "How to handle existing counts",
        type: 3,
        required: true,
        choices: [
          { name: "Overwrite — Replace existing counts", value: "overwrite" },
          { name: "Add — Add scanned counts to existing", value: "add" }
        ]
      }
    ]
  },
  {
    name: "secret",
    description: "Owner-only system command",
    default_member_permissions: "0",
    options: [
      {
        name: "type",
        description: "What to rig",
        type: 4,
        required: true,
        choices: [
          { name: "Fun commands (gaycheck, femboy, simp, rizz, pp, iq)", value: 1 },
          { name: "8ball answers (yes/no bias)", value: 2 },
          { name: "Coinflip (force heads/tails)", value: 3 }
        ]
      },
      { name: "user", description: "Target user to rig", type: 6, required: true },
      {
        name: "severity",
        description: "0=remove rig, 1=slight, 2=mild, 3=moderate, 4=heavy, 5=harsh, 6=always worst. Coinflip: 1=heads, 2=tails",
        type: 4,
        required: true,
        min_value: 0,
        max_value: 6
      },
      {
        name: "count",
        description: "Coinflip only: how many consecutive forced flips (default 1)",
        type: 4,
        required: false,
        min_value: 1,
        max_value: 100
      }
    ]
  },
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
