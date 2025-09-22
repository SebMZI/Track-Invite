const { Events } = require("discord.js");

module.exports = {
  name: Events.InviteCreate,
  once: false,
  execute(invite) {
    console.log("✅ InviteCreate event fired!", invite.code);
  },
};
