// Set a constant for the timeout role that will be used by the Watchdog.
const timeout_role_name = 'Colette::Timeout';

/**
 * Class [Watchdog]
 *
 * This class defines the properties of the [Watchdog] plugin. 
 *
 * The Watchdog is a functionality that's used for security and moderation in a guild.
 * Every message is watched by the watchdog, and it implements anti-spam protection in a server
 * by default.
 *
 * It implements the following commands:
 * 	-- Watchdog 	: 	Enable and disable the watchdog in a guild. Check status of watchdog in a guild.
 * 	-- Timeout 		: 	Timeout a user for a given time.
 * 	-- Purge 			: 	Delete last messages sent by a user.
 * 	-- Roulette 	: 	A game where a user plays russian roulette and can get timed out if they die.
 * 	-- Seppuku 		: 	Commit suicide.
 *
 *
 * === Properties ===
 * - {client}     : The Discord Bot client.
 * - {timeouts}		:	Users that are timed out. This is stored so it can be removed later.
 * - {logs}				: Message logs for users. Each message is stored in a log for a given time.
 * - {maxSpree}		: Brute force attacks configuration. The max amount of messages that can be machine-gunned.
 */
class Watchdog {

	constructor(client) {

		// The Maiden client.
		this.client = client;

		// Initialize object to store timeouts.
		this.timeouts = {};

		// Initialze object to store message logs.
		this.logs = {};

		// The max amount of the same messages that can be sent.
		this.maxSpree = 3;

		// Role and configuration setup
		this.build();

		// Set listener.
		this.listen();

	}

	/**
	 * Listener for the Watchdog plugin.
	 * This listener will determine what the Watchdog will do upon receiving messages.
	 */
	listen() {
		// We need to add a ready around this, or else the client will not be set when we try to push the listener.
		this.client.on('ready', () => {

			// Add listener to client.
			this.client.listeners.push({
				// Push the listener's listen function.
				listen: (client, message) => {

					// Don't watch the message if it's in a PMChannel.
					if (message.channel.type == 'dm') {
						return false;
					}

					// Don't watch the message if the message comes from this client.
					if (message.author.id === this.client.user.id) {
						return false;
					}

					// Don't watch the message if the watchdog isn't enabled in this guild.
					if (this.guilds[message.guild.id] === false) {
						return false;
					}

					// If everything goes through, let's watch.
					this.watch(message);

					return;
				},

			});


		});
	}

	/**
	 * Watchdog's 'watch' functionality.
	 * When a message is 'watched', the watchdog does some actions.
	 * @param  {Discord Message} message Message that is being watched.
	 */
	watch(message) {

		// Fetch the message log for the current guild.
		var guildlog = this.logs[message.guild.id];

		// Initialize a member log for the member in the guildlog.
		// Member logs have three properties:
		//  - spree : Current mimic message spree.
		//  - cache : An array that holds the last messages sent by the user.
		//  - spitfire : A secondary cache that holds the messages sent in a machine gun. This cache clears way faster.
		if (!(message.author.id in guildlog)) {
			guildlog[message.author.id] = {
				spree: 1,
				cache: [],
				spitfire: [],
			};
		}

		// Fetch the message log for the current member in the current guild.
		var memberlog = guildlog[message.author.id];

		// This is Wat
		if(message.author.id === '84100810870358016') {
			// Let's ban em.
		}

		// Push the message, regardless of content or spitfire, into the spitfire log.
		memberlog.spitfire.push(message);

		// Timeout users that have sent more than 4 messages in less than a second.
		if (memberlog.spitfire.length >= 4) {
			this.timeout(message.member, 10);
			message.channel.send(`${message.member} Take your face off your keyboard bud~ :yum:\nNo but SERIOUSLY! Relax. :)`);
			memberlog.spitfire.every((msg) => {
				msg.delete();
				return true;
			});
			
			// Reset the user's log.
			this.resetlog(memberlog);

			return;
		}

		// Set a timepout to clear the spitfire cache in 0.75 seconds
		// See? It clears very fast.
		memberlog.spitclear = setTimeout(() => {
			memberlog.spitfire = [];
		}, 750);

		// Add message to regular cache.
		memberlog.cache.push(message);

		// Increment spree only if the content is the same as the last message.
		if (memberlog.cache.length > 1 && message.content === memberlog.cache[memberlog.cache.length - 2].content) {
			memberlog.spree++;
		}

		// If the spree hits the max, the user will get timed out.
		if (memberlog.spree === this.maxSpree) {
			this.timeout(message.member, 10);
			message.channel.send(`Oops! Dropped my banhammer on ${message.member}...ACCIDENTALLY of course! :yum:\nNO SPAM BUDDY! Watch yourself! :angry:`);
			// message.channel.send(`?`, {files: [this.client.assets + 'watchdog/banhammer.png']});
			memberlog.cache.slice(Math.max(memberlog.cache.length - this.maxSpree)).every((msg) => {
				msg.delete();
				return true;
			});

			// Reset the user's log.
			this.resetlog(memberlog);

			return;
		}

		// The spree is cleared after 2 seconds.
		memberlog.spreeclear = setTimeout(() => {
			memberlog.spree = 1;
		}, 2000);
		
	}
 
 	/**
 	 * Timeout a user.
 	 * @param  {Discord Guild Member} member   Member to be timed out.
 	 * @param  {Integer} 							duration Duration to be timed out for in SECONDS.
 	 */
	timeout(member, duration) {

		// Fetch the timeout role.
		var timeout_role = member.guild.roles.find('name', timeout_role_name);

		// If the timeout role is not found in the guild, we can't do anything.
		if (timeout_role === null) {
			console.log('Timeout role not found in guild.');
			return false;
		}

		// Add the timeout role to the member.
		// The timeout role has no permissions to write anywhere.
		member.addRole(timeout_role);

		// Set a timeout to free them after the duration.
    setTimeout(() => {
      member.removeRole(timeout_role);
    }, duration * 1000);

		return;
	}

	/**
	 * Free a member.
	 * @param  {Discord Guild Member} member Member to be set free.
	 */
	clear(member) {

		// Fetch timeout role from guild.
		var timeout_role = member.guild.roles.find('name', timeout_role_name);

		// If the timeout role is not found in the guild, we can't do anything.
		if (timeout_role === null) {
			console.log('Timeout role not found in guild.');
			return false;
		}

		// Free the member.
		member.removeRole(timeout_role);

		return true;
	}

	/**
	 * Purge a member.
	 * @param  {Discord Guild Member} member The member to purge.
	 * @param  {Integer} 							count  The number of messages to purge from the member.
	 */
	purge(member, count) {
		var memberlog = this.logs[member.guild.id][member.id];

		memberlog.cache.slice(Math.max(memberlog.cache.length - count - 1)).every((msg) => {
			msg.delete();
			return true;
		});

		// Reset member's logs after purge.
		this.resetlog(memberlog);

		return;

	}

	/**
	 * Reste a member's log.
	 * @param  {Object} memberlog Member log object.
	 */
	resetlog(memberlog) {
		memberlog.cache = [];
		memberlog.spitfire = [];
		memberlog.spree = 1;

		return;
	}

	/**
	 * Enable the Watchdog in a given guild.
	 * @param  {Discord Guild (Server)} guild Guild to enable the Watchdog in.
	 */
	enable(guild) {
		this.guilds[guild.id] = true;
		// @TODO - Rebuild.
		this.save();
		return true;
	}

	/**
	 * Disable the Watchdog in a given guild.
	 * @param  {Discord Guild (Server)} guild Guild to disable the Watchdog in.
	 */
	disable(guild) {
		this.guilds[guild.id] = false;
		// @TODO - Rebuild.
		this.save();
		return true;
	}

	/**
	 * Get the status of the Watchdog in a given guild.
	 * @param  {Discord Guild (Server)} guild Guild to get the Watchdog status from.
	 */
	status(guild) {
		return this.guilds[guild.id];
	}

	/**
	 * Save configurations.
	 */
	save() {
		fs.writeFileSync(this.config_path, JSON.stringify(this.guilds, null, 2));
	}

	/**
	 * Build core Watchdog necessities.
	 */
	build() {

		// A ready container is needed her since this is done on construction.
		// We can only manipulate guilds after the client is ready.
		this.client.on('ready', () => {

			// Build roles in all servers and do necessary cleanup.
			this.client.guilds.every((guild) => {

				// Initiate the guild log.
				this.logs[guild.id] = {};

				// Get the Timeout role in the guild.
				var role = guild.roles.find('name', timeout_role_name);

				// Create the maiden timeout role if it doesn't exist.
				// @TODO - For disabled guilds, remove the role as it is not needed.
				// @TODO - This can be refactored and cleaned a little bit.
				if (role === null) {
					guild.createRole({
			      name: timeout_role_name,
			      color: '#36393F',
			      mentionable: true,
			      permissions: 1049600,
			    }).then((new_role) => {
			    	// In every channel of the guild, set SEND_MESSAGES permissions for this new role to DENY.
				    guild.channels.every((channel) => {
				    	channel.overwritePermissions(new_role, {'SEND_MESSAGES': false, 'ATTACH_FILES': false, });
				    	return true;
				    });
			    });
				} else {
					// In every channel of the guild, set SEND_MESSAGES permissions for this new role to DENY.
					guild.channels.every((channel) => {
			    	channel.overwritePermissions(role, {'SEND_MESSAGES': false, 'ATTACH_FILES': false, });
			    	return true;
			    });

					// Free all members on reboot.
					// This is to prevent eternally timed out members.
			    guild.members.every((member) => {
			    	this.clear(member);
			    	return true;
			    });
				}

				return true;

			});

			// Make configuration directory if it doesn't exist.
			var config_dir = this.client.coreroot + 'plugins/watchdog/config';
			if (!fs.existsSync(config_dir)) {
				fs.mkdirSync(config_dir);
			}

			// Get path to the appropriate configuration directory or make it if it
			// doesn't exist.
			var desired_config_dir = this.client.coreroot + 'plugins/watchdog/config/' + this.client.maiden_name;
			if (!fs.existsSync(desired_config_dir)) {
				fs.mkdirSync(desired_config_dir);
			}

			// Store path to the configuration in the Watchdog object.
			this.config_path = desired_config_dir + '/guilds.json';

			// Build Configurations and store them in the Watchdog.
			this.guilds = {};

			// If the configurations already exist, load them.
			if(fs.existsSync(this.config_path)) {
				this.guilds = JSON.parse(fs.readFileSync(this.config_path));
			}

			// If the configurations were loaded, we'll stop here.
			if (!_.isEmpty(this.guilds)) {
				this.client.on('ready', () => {
					console.log('Maiden Watchdog: Loaded guild config from files.');
					// this.client.home.channel.send(`**Watchdog**: Enabled guilds configuration successfully loaded. @TODO - Show where watchdog is enabled.`);
				});

				return;
			}

			// If the configurations couldn't be loaded, we'll initialize them here and save them to the config path.
			this.client.guilds.every((guild) => {
				this.guilds[guild.id] = false;
				return true;
			});

			console.log('Maiden Watchdog: Guild config not found. Created default guild config.');

			// Save guild configurations.
			this.save();

			return;
		});
	}
}

module.exports = Watchdog;