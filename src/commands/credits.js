const { reply, ephemeral, embed } = require("../utils/respond");

function creditsCmd() {
  return reply({
    embeds: [embed({
      title: "\uD83D\uDCDC Credits",
      description: "Click below to view the developer info.",
      color: 0x2b2d31,
      footer: "Xenon Hub"
    })],
    components: [{
      type: 1,
      components: [{
        type: 2,
        style: 2,
        label: "View Credits",
        custom_id: "credits_view",
        emoji: { name: "\uD83D\uDC64" }
      }]
    }]
  });
}

function handleBtn(id) {
  if (id === "credits_view") {
    return ephemeral({
      embeds: [embed({
        title: "\uD83D\uDC64 Developer",
        description: "<@282997545620209665> is the sole developer. Contact him if you need any support/inquiries about the script or any opportunities.",
        color: 0x5865f2
      })]
    });
  }
  return null;
}

module.exports = { creditsCmd, handleBtn };
