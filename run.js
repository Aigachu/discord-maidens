/**
 * Run File for Sora's main functionalities.
 * This file is used to manage connection to discord as well as to bring together
 * all other parts of Sora. Ideally, this file will remain clean, and will pull
 * in data and functions through module exports and requires.
 *
 * We will also be setting globals in this file for use across the application.
 *
 * Sora likes it when it's clean, so keep it tidy!
 *
 * UPDATE 4/20/2016 BLAZE IT!!!
 * Sora is now using Discord's main API!
 *
 * Use this link to get others to add her to their servers:
 * https://discordapp.com/oauth2/authorize?&client_id=172474398308040704&scope=bot&permissions=0
 *
 * Last note - See README.md for more details!
 *
 * Happy Dimension Traveling! :-) <3
 *
 */

/* === Globals === */

// Must run `npm install --save discord.js` if this is not installed or found.
GLOBAL.Discord = require("discord.js");

// Get jsonfile module ; Used to facilitate json reading and writing.
GLOBAL.jsonfile = require("jsonfile");

// Node API: util
GLOBAL.util = require('util');

/* === Default Command Configuration Paramater Values === */
// The default values for a new command.
// Commands that have no configuration declaration in the commands_properties.json configuration file will be given these values by default.
GLOBAL.default_command_config = {
  oplevel:            2,
  description:        '',
  help_text:          '',
  allowed_channels:   'all',
  excluded_channels:  'none',
  cooldown:           'none',
  aliases:            'none'
};

/* === Default Server Configuration Paramater Values === */
// The default values for a new server.
// Servers that have no configuration declaration in the servers_properties.json configuration file will be given these values by default.
GLOBAL.default_server_config = {
  name:                   "",
  general_channel:        "",
  announcement_channel:   "",
  timeout_role_name:      "Timeout",
  admin_roles:            [],
  override_all_commands:  false
};

GLOBAL.server_specific_command_params = {
  enabled: '',
  overridden: ''
};

// Get Sora's configuration details.
// A real discord account must be created for the bot to run.
// Put the credentials of the newly created account into `conf/main.json` found at the same level as this file.
GLOBAL.config = require("./config/main.json");

// Get all defined commands in the `Commands.js` file.
GLOBAL.tools = require("./src/tools.js");

// Get all defined commands in the `Commands.js` file.
GLOBAL.commands = require("./src/commands.js").commands;

// @todo doc
var loader = require("./src/loader.js");

/* === Requires END === */

/* === Variables Start === */

/* === Variables End === */

// Initiate the Discord Client.
var sora = new Discord.Client();

sora.on("ready", function () {
  console.log("\nSora: I am now properly linked to the Discord infrastructure. Enjoy!");

  /* === On-Boot Tasks === */
  // Loads and modifies the command configuration file.
  if(loader.loadCommConf()) {
    setTimeout(function(){
      if(!loader.loadServConf(sora)) {
        console.log("Sora: The server configuration file needs a command configuration file to be generated. Please re-run the code!");

        //exit node.js with an error
        process.exit(0);
      } else {
        // Get custom coded functions saved in the `tools.js` file.
        var tools = require("./src/tools.js");

        // Get all defined commands in the `Commands.js` file.
        var commands = require("./src/commands.js").commands;

        /**
         * Event that fires when Sora receives a message.
         * @param  {Object} msg)
         * @todo : add example msg object reference to Wiki.
         */
        sora.on("message", function (msg) {

          /* === COMMANDS TREATMENT START === */

          // Only hop in here and treat commands if this isn't Sora's own message!
          if(msg.author.id !== sora.user.id) {
            var key = "";

            if(key = tools.isCommand(msg)) {

              // Initialize the parameters variable as an array with all words in the message seperate by a space.
              var params = msg.content.split(" ");

              // Remove the first two elements of the array, which in the case that this is a command, are the following:
              // params[0] = $sora.
              // params[1] = command_key.
              params.splice(0, 2);

              // Now, the params array only contains the parameters of the command.

              // Run Command if it passed approval.
              if(tools.authCommand(sora, msg, key)) {
                commands[key].fn(sora, params, msg);
              }

            }

            // LOL
            if(sora.THIRDEYE !== undefined && !tools.isCommand(msg)) {
              tools.thirdeye(sora, msg, sora.THIRDEYE);
            }
          }

          /* === COMMANDS TREATMENT END === */
        });

      }
    }, 500);
  }

  /* === On-Boot Tasks END === */
});

// When Sora disconnects from Discord.
sora.on("disconnected", function () {
  //alert the console
  console.log("Sora has been disconnected from the Discord infrastructure!");

  //exit node.js with an error
  process.exit(1);
});

// Login to Discord after processing all the code above.
sora.loginWithToken('MTcyNDc0NDQ0MDI1OTU0MzA0.CfmU2A.W-0vB6qoS4KKciPj6aRXhqtGML4');