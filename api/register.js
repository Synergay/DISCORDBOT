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
  { name: "scripts", description: "Open the script selection panel" },
  { name: "executors", description: "View the executor list" },
  {
    name: "update-executor",
    description: "Update the timestamp for executors",
    options: [
      {
        name: "platform", description: "Platform", type: 3, required: true,
        choices: [
          { name: "PC", value: "pc" },
          { name: "Mobile", value: "mobile" }
        ]
      },
      {
        name: "type", description: "Executor type", type: 3, required: true,
        choices: [
          { name: "Free (PC)", value: "free" },
          { name: "Paid (PC)", value: "paid" },
          { name: "Android (Mobile)", value: "android" },
          { name: "iOS (Mobile)", value: "ios" }
        ]
      }
    ]
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
          { name: "Credits", value: "credits" },
          { name: "Price Info", value: "priceinfo" },
          { name: "Executors", value: "executors" }
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
  { name: "updatekeyless", description: "Edit keyless features list" },
  { name: "updateprices", description: "Edit premium pricing (live message)" },
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
