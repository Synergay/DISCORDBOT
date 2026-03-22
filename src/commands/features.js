const { reply, ephemeral, embed } = require("../utils/respond");

function featuresCmd() {
  return reply({
    embeds: [embed({
      title: "✨ Features for Xenon Hub",
      description: "Select a category below to view available features.",
      color: 0x5865f2,
      footer: "Xenon Hub • Features"
    })],
    components: [{
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "Premium",
          custom_id: "features_premium",
          emoji: { name: "💎" }
        },
        {
          type: 2,
          style: 1,
          label: "Keyless",
          custom_id: "features_keyless",
          emoji: { name: "🔓" }
        }
      ]
    }]
  });
}

function handleBtn(id) {
  if (id === "features_premium") {
    return ephemeral({
      embeds: [embed({
        title: "💎 Premium Features",
        description: "placeholder",
        color: 0xffd700
      })]
    });
  }
  if (id === "features_keyless") {
    return ephemeral({
      embeds: [embed({
        title: "🔓 Keyless Features",
        description: "placeholder",
        color: 0x57f287
      })]
    });
  }
  return null;
}

module.exports = { featuresCmd, handleBtn };
