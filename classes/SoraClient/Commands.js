// @TODO - DOCUMENTATION

/**
 * TO MODIFY
 * @fileOverview Sora's main file.
 * This file is used to manage connection to discord as well as to bring together
 * all other parts of Sora. Ideally, this file will remain clean, and will pull
 * in data and functions through module exports and requires.
 *
 * Sora likes it when it's clean, so keep it tidy!
 */

/* === Commands Start! === */

/**
 * COMMANDS Object
 * Holds COMMANDS objects.
 * Defines actions taken when certain commands are called in chat.
 * @type {Array}
 */
var commands = {};

/**
 * Commands Description
 * -- oplevel: The restriction of who can use the command.
 *  - 0 -> Anyone can use the command.
 *  - 1 -> Only ADMINS can use the command. (All user IDs in the ADMINS array above)
 *  - 2 -> Only the GOD can use the command. (The GOD ID in the variable above)
 *
 * -- allowed_channels: Channels in which the command works.
 *  - 'all' -> Will work in all channels.
 *  - [CHANNEL_ID_1, CHANNEL_ID_2, ...] -> Array of all channel IDs where the command will work.
 *
 * -- allowed_servers: Servers in which the command works.
 *  - 'all' -> Will work in all servers.
 *  - [SERVER_ID_1, SERVER_ID_2, ...] -> Array of all server IDs where the command will work.
 *
 * -- cooldown: Cooldown time of the command (in seconds)
 *  - 20 -> 20 seconds.
 *  - 40 -> 40 seconds.
 *    - Any number here works.
 *
 * -- fn: function( bot, params, msg, msgServer, serverRoles, authorRoles ) {
 *      // Your code for the command goes here.
 *    }
 *  - bot -> Bot object to use for bot actions.
 *  - params -> Command parameter array.
 *    - If the command is  "!test 5 peach 8" ...
 *    - params[1] = 5,
 *    - params[2] = peach,
 *    - params[3] = 8.
 *   - msg -> Message object of the invoked message that triggered the command.
 *   - msgServer -> Server that the message arrived from.
 *   - serverRoles -> All roles of the server that the command was invoked from in an array.
 *   - authorRoles -> All roles of the author that invoked the command.
 */

/**
 * Implements the *ping* command.
 * @params  {[none]}
 * @result  {[message]} [Sora answers asking if she's needed.]
 */
commands.ping = {
  fn: function( sora, params, msg ) {

    sora.sendMessage(msg.channel, "Yes, " + sora.helpers.printUserTag(msg.author) + "? What can I do for you?");

  }
}

/**
 * Implements the *pong* command.
 * @params  {[none]}
 * @result  {[message]} [Sora answers asking if she's needed.]
 */
commands.pong = {
  fn: function( sora, params, msg ) {

    sora.sendMessage(msg.channel, "Mm?...Anything you might need from me, " + sora.helpers.printUserTag(msg.author) + "?");

  }
}

/**
 * [guid description]
 * @type {Object}
 */
commands.guid = {
  fn: function( sora, params, msg ) {
    if(params[0]) {
      var userID = sora.helpers.extractID(params[0]);
      var user = sora.users.get("id", userID);
      sora.deleteMessage(msg);
      sora.sendMessage(sora.users.get("id", msg.author.id), "Hey Aigachu! Here's the requested id of the user: **" + user.username + "**\n\n**" + userID + "**");
    } else {
      sora.deleteMessage(msg);
      sora.sendMessage(sora.users.get("id", msg.author.id), "Heyyy...Ya done messed up mang. Add a parameter to the command. >.>");
    }
  }
}

/**
 * Implements the *chname* command.
 * @params  {[none]}
 * @result  {[message]} [Sora changes her display name. Don't worry, she will always be Sora to us. ;)]
 */
commands.chname = {
  fn: function( sora, params, msg ) {
    if(sora.helpers.val(params)) {

      var newName = msg.content.substring(msg.content.indexOf(params[0]), msg.content.length);

      sora.setUsername(newName).catch(function(err){
        if(err) {
          sora.sendMessage( msg.channel, "There seems to have been an error.\nAllow me to format it for you.\n\n```" + err + "```\nI have logged the console with more information.");
          console.log(err);
        } else {
          sora.sendMessage( msg.channel, "Got it! I'll change my name right now.");
        }
      });

    } else {
      sora.sendMessage( msg.channel, "You seem to have forgotten a parameter. Please tell me what to change my display name to!");
    }
  }
}

/**
 * Implements the *coin* command.
 * @params  {[none]}
 * @result  {[message]} [Sora changes her display name. Don't worry, she will always be Sora to us. ;)]
 */
commands.coin = {
  fn: function( sora, params, msg ) {
    if(sora.helpers.val(params, 0)) {
      var flip = Math.floor(Math.random() * 2) + 1;

      flip = ((flip == 1) ? 'Heads' : 'Tails');

      var flip_types = [];
      flip_types.push({
        message: "_Coinflip emulation has begun. Just a moment..._",
        timeout: 2
      });
      flip_types.push({
        message: "_Coinflip emulation has begun. Looks like..._",
        timeout: 1
      });
      flip_types.push({
        message: "_Coinflip emulation has begun. The coin spins_\nWait for it...",
        timeout: 5
      });

      var rand = flip_types[Math.floor(Math.random() * flip_types.length)];

      sora.sendMessage(msg.channel, rand.message);
      sora.startTyping(msg.channel);

      setTimeout(function(){
        sora.sendMessage(msg.channel, "<@" + msg.author.id + "> obtained **" + flip + "** !");
        sora.stopTyping(msg.channel);
      }, 1000 * rand.timeout);
    } else {
      sora.sendMessage( msg.channel, "You seem to have made a mistake with your command. Try using the `help` command! I can remind you about the way a command is used.");
    }
  }
}

/**
 * Implements the *help* command.
 * @params  {[none]}
 * @result  {[message]} [Sora changes her display name. Don't worry, she will always be Sora to us. ;)]
 */
commands.help = {
  fn: function( sora, params, msg ) {
    if(sora.helpers.val(params, 0)) {

      // Print general help text for all commands.
      sora.sendMessage(msg.channel, 'I *should* print the general help message, but Aigachu hasn\'t written it yet. Lazy bum!');

      return;

    } else if(sora.helpers.val(params)) {

      var command_object = sora.commands_configs[params[0]];

      if(command_object == undefined) {
        sora.sendMessage(msg.channel, "I don't think that command exists...");

        return;
      }

      if(command_object['help_text'].length == 0) {

        sora.sendMessage(msg.channel, "This command doesn't seem to have help text set. Bummer! Hassle Aigachu and tell him to update the documentation! :scream:");

        return;

      } else {

        sora.sendMessage(msg.channel, command_object['help_text']);

        return;

      }

    } else {
      sora.sendMessage( msg.channel, "Hmm. That doesn't seem to be the proper use of the help command.");

      return;
    }
  }
}

/**
 * Implements the *dlist* command.
 * @params  {[none]}
 * @result  {[message]} [Sora changes her display name. Don't worry, she will always be Sora to us. ;)]
 */
commands.dlist = {
  fn: function( sora, params, msg ) {
    // Servers Object
    var all_servers = sora.servers;

    var message = "Here is the list of all worlds I am linked to, as well as their channels!\n";

    message += '```\n';

    for( var server_key in all_servers ) {
      if( all_servers.hasOwnProperty(server_key) && server_key != 'limit' && server_key != 'length') {

        var server = all_servers[server_key];
        var server_all_channels = server.channels;
        message += server.name + "\n";

        for (var channel_key in server_all_channels ) {
          if( server_all_channels.hasOwnProperty(channel_key) && channel_key != 'limit' && channel_key != 'length' ) {

            var channel = server_all_channels[channel_key];
            message += '-- ' + channel.name + "\n";

          }
        }

        message += '\n'
      }
    }

    message += '```\n';

    sora.sendMessage( msg.channel, message);

  }
}


/**
 * Implements the *thirdeye* command.
 * @params  {[none]}
 * @result  {[message]} [Sora changes her display name. Don't worry, she will always be Sora to us. ;)]
 */
commands.thirdeye = {
  fn: function( sora, params, msg ) {

    var this_dimension = msg.channel.server;

    var this_world = msg.channel;

    var their_dimension = sora.servers.get("name", sora.helpers.extractParam('{', '}', msg));

    var their_world = their_dimension.channels.get("name", sora.helpers.extractParam('[', ']', msg));

    sora.THIRDEYE = {
      this_dimension: this_dimension,
      this_world: this_world,
      their_dimension: their_dimension,
      their_world: their_world,
    };

    var message = "";

    message = "The __**third eye**__, Aigachu?...";

    message += "\n";

    message += "Well alright...But be careful! You wouldn't want to cause a *mess*, now would you? ;) :blue_heart:";

    message += "\n";

    message += "A-And remember that this is a very primitive version of this functionality! Please be careful with using it. :fearful:";

    message += "\n";

    message += "I will now establish a link between the following servers & channels:";

    message += "\n\n```\n";

    message += this_dimension.name + " -- " + this_world.name + "\n";

    message += "\n```";

    message += "\n\n```\n";

    message += their_dimension.name + " -- " + their_world.name + "\n";

    message += "\n```";

    sora.sendMessage( msg.channel, message );

  }
}

/* === Commands End! === */

// Export the Commands object for use in `sora.js`
exports.commands = commands;