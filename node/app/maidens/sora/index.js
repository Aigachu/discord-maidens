var SoraDiscordClass = require('./src/soradiscord/SoraDiscord');
var SoraDiscordClient = new SoraDiscordClass(require('./settings'));

/**
* === Exports ===
* When this folder is required, this is what's sent to the variable.
*/
module.exports = {
  SoraDiscord: SoraDiscordClient,
};