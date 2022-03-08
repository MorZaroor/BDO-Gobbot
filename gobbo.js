const Discord = require('discord.js');
const bot = new Discord.Client();
const moment = require('moment');
var auth = require('./auth.json');
var fs = require('fs');

// Bosses Variables
var spawntable = require("./spawntable.json");
var spawn = spawntable["spawn"];
var boss_list = spawntable["list"];
var spawnday = spawntable["spawnday"];
var spawnmsg = "will spawn in <15> minutes! Prepare yourselves you beautiful goblins!! * :3 * ";
var time_table = spawntable["times"];
var game_time_table = spawntable["game_times"];

// General Variables
var prolog = "**```prolog\n";
var markdown = "**```md\n";
var markdown_end = "```**";
var mention = "<@&roleid-placeholder>";
var gobborole = 'roleid-placeholder';
var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

var NOTIFY_CHANNEL;
bot.on('ready', () => {
	NOTIFY_CHANNEL = bot.channels.find('id', 'channelid-placeholder'); // Channel to send notification
});

setInterval(function() 
{
	var now = new Date();
	var day = days[ now.getDay() ];
	var h = now.getHours();
	var m = now.getMinutes();
	var s = now.getSeconds();
	
	// getboss check from here
	if((h == 1 && m === 0) || (h == 2 && m == 45) || (h == 5 && m == 45) || (h == 9 && m == 45) || (h == 16 && m == 45) || (h == 19 && m == 45)) 
	{
		getboss(spawn, h, m, day);
	}
	if(h == 12 && m == 45)
	{
	    if(day != 'Wednesday') 
	    {
		    getboss(spawn, h, m, day);
	    }
	}
	if(h == 20 && m === 45) 
	{
	    if(day == 'Sunday') 
	    {
		    NOTIFY_CHANNEL.send(`${mention}` + markdown + " < Guild Scroll Sunday > will start in <15> minutes! Make sure to check Announcements and use the Guild Teleport if available!   * :3 * " + markdown_end);
	    }
	}
	if(h == 23 && m === 0) 
	{
	    if(day != 'Saturday') 
	    {
		    getboss(spawn, h, m, day);
	    }
	}
	// bdotime check from here
	if( h <= 2)
	{
		bdotime(h, m, 2, 3);
	}
	else if( h <= 6)
	{
		bdotime(h, m, 6, 7);
	}
	else if( h <= 10)
	{
		bdotime(h, m, 10, 11);
	}
	else if( h <= 14)
	{
		bdotime(h, m, 14, 15);
	}
	else if( h <= 18)
	{
		bdotime(h, m, 18, 19);
	}
	else if( h <= 22)
	{
		bdotime(h, m, 22, 23);
	}
	//notification check from here
	sendnotificationalert(now, m)
}, 60 * 1000); // Check every minute

function getboss(spawn, hour, minute, day) 
{
	for ( var i = 0; i < spawn.length; i++ ) 
	{
		if ( spawn[i]["time"] == hour + ":" + minute ) 
		{
			var boss = (spawn[i][day]);
			for ( var b = 0; b < boss.length; b++) 
			{
				NOTIFY_CHANNEL.send(`${mention}` + markdown + " < " + boss[b] + " > " +  spawnmsg + markdown_end);
			}
		}
	}
}

function bdotime(hour, minute, nightstrt, nightend)
{
	var ingameh;
	var ingamem;
	var lastnight = nightstrt - hour;
	
	if( lastnight == 3 && minute <= 20)
	{
		ingameh = 0; 
		ingamem = 20 - minute;
		bot.user.setGame("Day in - " + ingameh + "h " + ingamem + "min");
	}
	else
	{
		ingameh = nightstrt - hour;
		if( minute <= 40)
		{
		    ingamem = 40 - minute;
			bot.user.setGame("Night in - " + ingameh + "h " + ingamem + "min");
		}
		else if( minute > 40)
		{
			if(ingameh > 0)
			{
				ingamem = 40 - minute;
				ingamem = ingamem + 60;
				ingameh = ingameh - 1;
				bot.user.setGame("Night in - " + ingameh + "h " + ingamem + "min");
			}
			else
			{
				ingamem = 20 - minute;
				ingamem = ingamem + 60;
				bot.user.setGame("Day in - " + ingameh + "h " + ingamem + "min");
			}
		}
	}
}


function getbosstime(message, input)
{
	if (input.includes('!w '))
	{
		var when_argument = input.split('!w ');
	}
	else
	{
		when_argument = input.split('!when ');
	}
	when_argument.shift();
	when_argument = when_argument.toString().split(' ');
	for ( var i = 0; i < when_argument.length; i++ )
	{
		if (when_argument[i].includes('/'))
		{
			var char_index = when_argument[i].indexOf('/');
			var boss_input = when_argument[i].charAt(0).toUpperCase() + when_argument[i].substr(1, char_index) + when_argument[i].charAt(char_index + 1).toUpperCase() + when_argument[i].substr(char_index + 2) ;
		}
		else
		{
			boss_input = when_argument[i].charAt(0).toUpperCase() + when_argument[i].substr(1);
		}
		bossloop:
			for ( var b = 0; b < boss_list.length; b++ )
			{
				if (boss_list[b].indexOf(boss_input) > -1)
				{
					boss_input = boss_list[b];
					var closest_time_table = [];
					var closest_day_table = [];
					var next_week_closest_time = [];
					var next_week_closest_day = [];
					var print_time = [];
					var print_time_next_week = [];
					var now = new Date();
					var date = now.getDate();
					var day = days[now.getDay()];
					var moment_now = now.toUTCString();
					var boss_full_time = now;
					var new_days = days.slice(0, days.length);
					while (day !== new_days[0])
					{
						new_days.push(new_days.shift());
					}
					dayloop:
						for ( var d = 0; d < new_days.length; d++ )
						{
							if (typeof closest_time_table !== 'undefined' && closest_time_table.length > 0)
							{
								continue dayloop;
							}
							for ( var t = 0; t < time_table.length; t++ )
							{
								if (spawnday[days.indexOf(new_days[d])][time_table[t]].indexOf(boss_input) > -1)
								{
									var boss_hour = time_table[t].split(':')[0];
									var boss_minute = time_table[t].split(':')[1];
									boss_full_time.setHours(boss_hour, boss_minute, 0);
									var duration = moment.duration(moment(boss_full_time).diff(moment(moment_now))).asMinutes();
									var minutes = duration % 60;
									var hours = (duration - minutes)/60;
									if (duration > 0)
									{
										print_time.push(hours, Math.round(minutes));
										closest_time_table.push(time_table[t]);
										closest_day_table.push(new_days[d]);
										continue dayloop;
									}
									else
									{
										if (day === new_days[d] && typeof next_week_closest_time !== 'undefined' && next_week_closest_time.length === 0)
										{
											next_week_closest_time.push(time_table[t]);
											next_week_closest_day.push(new_days[d]);
											var boss_full_time_next_week = new Date(boss_full_time);
											boss_full_time_next_week.setDate(date + 7);
											var duration_next_week = moment.duration(moment(boss_full_time_next_week).diff(moment(moment_now))).asMinutes();
											var minutes_next_week = duration_next_week % 60;
											var hours_next_week = (duration_next_week - minutes)/60;
											print_time_next_week.push(hours_next_week, Math.round(minutes_next_week))
										}
									}
								}
							}
							date += 1;
							boss_full_time.setDate(date);
						}
					var closest_time = closest_time_table[0];
					var closest_day = closest_day_table[0];
					if (day === next_week_closest_day[0] && typeof closest_time_table !== 'undefined' && closest_time_table.length === 0)
					{
						closest_time = next_week_closest_time[0];
						closest_day = next_week_closest_day[0];
						message.reply(markdown + "Closest" + " < " + boss_list[b] + " > " + "spawn time is " + "<" + game_time_table[closest_time] + "> * CEST * on <" + closest_day + " NEXT WEEK>, " + "in [" + print_time_next_week[0] + "h][" + print_time_next_week[1] + "m]" + markdown_end);
					}
					else if (day === closest_day_table[0])
					{
						message.reply(markdown + "Closest" + " < " + boss_list[b] + " > " + "spawn time is " + "<" + game_time_table[closest_time] + "> * CEST * <Today>, " + "in [" + print_time[0] + "h][" + print_time[1]+ "m]" + markdown_end);
					}
					else
					{
						message.reply(markdown + "Closest" + " < " + boss_list[b] + " > " + "spawn time is " + "<" + game_time_table[closest_time] + "> * CEST * on <" + closest_day + ">, " + "in [" + print_time[0] + "h][" + print_time[1] + "m]" + markdown_end);
					}
				}
			}
		if (boss_list.indexOf(boss_input) === -1)
		{
			message.reply(markdown + boss_input + " boss doesn't exist" + markdown_end);
		}
	}
}

function getclosestboss(message)
{
	var now = new Date();
	var moment_now = now.toUTCString();
	var date = now.getDate();
	var day = days[now.getDay()];
	var boss_time = now;
	var closest_time_table = {};
	var cest_time_table = {};
	var durations = [];
	var boss_list = {};
	var print_time = [];
	timeloop:
	for ( var t = 0; t < time_table.length; t++ )
	{
		if (spawnday[days.indexOf(day)][time_table[t]] == "Maintenance" || spawnday[days.indexOf(day)][time_table[t]] == "Conquest War")
		{
			continue timeloop;
		}
		var boss_hour = time_table[t].split(':')[0];
		var boss_minute = time_table[t].split(':')[1];
		boss_time.setHours(boss_hour, boss_minute, 0);
		var duration = moment.duration(moment(boss_time).diff(moment(moment_now))).asMinutes();
		var minutes = duration % 60;
		var hours = (duration - minutes)/60;
		if (duration > 0)
		{
			print_time.push(hours, Math.round(minutes));
			durations.push(duration);
			closest_time_table[duration] = time_table[t];
			cest_time_table[duration] = game_time_table[time_table[t]];
			boss_list[time_table[t]] = spawnday[days.indexOf(day)][time_table[t]];
		}
	}
	var smallest = Math.min(...durations);
	if (typeof closest_time_table !== 'undefined' && Object.keys(closest_time_table).length === 0)
	{
		var boss_date = new Date();
		boss_date.setDate(date + 1);
		boss_date.setHours(1,15,0);
		var boss_moment = boss_date.toUTCString();
		var diff = moment.duration(moment(boss_moment).diff(moment(moment_now))).asMinutes();
		var boss_minute = diff % 60;
		var boss_hour = (diff - boss_minute)/60;
		if (days.indexOf(day) == 6)
		{
			var spawn_thingy = spawnday[0]
		}
		else
		{
			spawn_thingy = spawnday[days.indexOf(day) + 1]
		}
		if (spawn_thingy[time_table[0]].length > 1)
		{
			message.reply(markdown + "The next bosses to spawn are " + " < " + spawn_thingy[time_table[0]][0] + " > and" + " < " + spawn_thingy[time_table[0]][1] + " > " + "and will spawn at " + "<" + game_time_table[time_table[0]] + "> * CEST * <Tomorrow> " + "in [" + boss_hour + "h][" + Math.round(boss_minute) + "m]" + markdown_end);
		}
		else
		{
			message.reply(markdown + "The next boss to spawn is " + " < " + spawn_thingy[time_table[0]][0] + " > " + "and will spawn at " + "<" + game_time_table[time_table[0]] + "> * CEST * <Tomorrow> " + "in [" + boss_hour + "h][" + Math.round(boss_minute) + "m]" + markdown_end);
		}
	}
	else
	{
		if (boss_list[closest_time_table[smallest]].length > 1)
		{
			message.reply(markdown + "The next bosses to spawn are " + " < " + boss_list[closest_time_table[smallest]][0] + " > and" + " < " + boss_list[closest_time_table[smallest]][1] + " > " + "and will spawn at " + "<" + cest_time_table[smallest] + "> * CEST * <Today> " + "in [" + print_time[0] + "h][" + print_time[1] + "m]" + markdown_end);
		}
		else
		{
			message.reply(markdown + "The next boss to spawn is " + " < " + boss_list[closest_time_table[smallest]][0] + " > " + "and will spawn at " + "<" + cest_time_table[smallest] + "> * CEST * <Today> " + "in [" + print_time[0] + "h][" + print_time[1] + "m]" + markdown_end);
		}
	}
}

function getnotification(message, input)
{
	if (input === "!notify" || input === "!n")
	{
		if (fs.existsSync("./notifications.txt"))
		{
			var list = fs.readFileSync("./notifications.txt", "utf8");
			message.reply(markdown + "< Showing notifications list: >\n" + "\n" + list + markdown_end )
		}
		else
		{
			message.reply("Got nothing for ya mate :3")
		}
	}
	else if (input === "!notify clear" || input === "!n clear")
	{
		if (message.author == "<@ownerid-placeholder>" || message.author == "<@ownerid2-placeholder>")
		{
			if (fs.existsSync("./notifications.txt"))
			{
				fs.unlinkSync("./notifications.txt")
				message.reply("Haiiiii master, notifications reset! \\*^\\*")
			}
			else
			{
				message.reply("Don't see nothing there, sir! o\\ ")
			}
		}
		else
		{
			message.reply("Sorry newbie, you don't have enough chakra to reset me ;P")
		}
	}
	else
	{
		if (input.includes("!n "))
		{
			var notify_argument = input.split('!n ');
		}
		else
		{
			var notify_argument = input.split('!notify ');
		}
		notify_argument.shift();
		notify_argument = notify_argument.toString().split(',');
		var now = new Date();
		var default_value = now.getMinutes();
		now = now.toUTCString();
		for ( var i = 0; i < notify_argument.length; i++ )
		{
			var new_argument = notify_argument[i].toString().split(';');
			for ( var a = 0; a < new_argument.length; a+=2 )
			{
				var stream = fs.createWriteStream("./notifications.txt", {flags:'a'});
				if (notify_argument[i].includes(';') === false)
				{
					stream.write("[\"" + now + "\",\"" + message.author.id + "\",\"" + default_value.toString().trim() + "\",\"" + new_argument[a].trim() + "\"]" + "\n");
					stream.end();
					message.reply("**" + new_argument[a].trim() + "** notification saved for " + message.author + ". Will notify **14** mins after entered registration time :>");
				}
				else
				{
					if (parseInt(new_argument[a]) < 60 && parseInt(new_argument[a]) >= 0)
					{
						stream.write("[\"" + now + "\",\"" + message.author.id + "\",\"" + new_argument[a].trim() + "\",\"" + new_argument[a+1].trim() + "\"]" + "\n");
						stream.end();
						message.reply("**" + new_argument[a+1].trim() + "** notification saved for " + message.author + ". Will notify **14** mins after entered registration time :>");
					}
					else
					{
						message.reply("Sheesh, don't you know how time works? 0-59 only :|");
						return
					}
				}
			}
		}
	}
}

function sendnotificationalert(date, minutes)
{
	if (fs.existsSync("./notifications.txt"))
	{
		var list = fs.readFileSync("./notifications.txt", "utf8");
		var lines = list.split('\n');
		if (lines.length > 1)
		{
			for (var i = 0; i < lines.length - 1; i++)
			{
				var line = JSON.parse(lines[i]);
				var time = line[0];
				var notify_minute = parseInt(line[2]);
				var delete_diff = moment.duration(moment(date).diff(moment(time))).asMinutes();
				if (notify_minute + 14 > 59)
				{
					notify_minute -= 60;
					if (notify_minute + 14 == minutes)
					{
						bot.users.get(line[1]).send(markdown + " REMINDER ABOUT THE THING WITH THE THING!! - < " + line[3] + " >" + markdown_end);
					}
				}
				else {
					if (notify_minute + 14 == minutes)
					{
						bot.users.get(line[1]).send(markdown + " REMINDER ABOUT THE THING WITH THE THING!! - < " + line[3] + " >" + markdown_end);
					}
				}
				if (delete_diff > 16)
				{
					var stream = fs.createWriteStream("./notifications.txt");
					var new_lines = list.split("\n").slice(1).join("\n");
					stream.write(new_lines);
					stream.end();
				}
			}
		}
	}
}

bot.on("message", function(message)
	{
		var input = message.content.toLowerCase().replace(/ +(?= )/g,'');
		if (input === "!when table" || input === "!w table" || input === "!wt")
		{
			message.reply("**Showing Boss Table:**", {files: ["charturl-placeholder"]});
		}
		else if (input.includes("!when ") || input.includes("!w "))
		{
			getbosstime(message, input);
		}
		else if (input === "!when" || input === "!w")
		{
			getclosestboss(message)
		}
		else if (input === "!notify" | input === "!n")
		{
			getnotification(message, input)
		}
		else if (input.includes("!notify ") || input.includes("!n "))
		{
			getnotification(message, input)
		}
		else if (input === "!ping")
		{
			message.reply("Pong! OwO");
		}
		else if (input === "!gimmegimme")
		{
			message.reply("MOAR MOAR");
		}
		else if (input === "!love")
		{
			message.reply("A-Aww Gobbo loves you too ^_^ :heart:");
		}
		else if (input === "!poke")
		{
			message.reply("That's sexual harassment 3-3");
		}
		else if (input === "!pet")
		{
			message.reply("Nyan~");
		}
		else if (input === "!whatislove")
		{
			message.reply("BABY DONT HURT ME ;;-;;");
		}
		else if (input === "!sogood")
		{
			message.reply("I-it doesn't make me happy when you praise meeee b-baka!!#$!$! :blush: ^_________^ ");
		}
		else if (input === "!morfun")
		{
			message.reply("<@ownerid-placeholder> **When you say someone is FEATHERY or SCALEY...**", {files: ["pictureurl-placeholder", "pictureurl-placeholder"]});
		}
		else if (input === "!gobblegobble")
		{
			if (message.member.roles.has(gobborole))
			{
				message.reply("is already gobbo's friend! :3 ");
			}
			else
			{
				message.member.addRole(gobborole).then(console.log).catch(console.error);
				message.reply("is gobbo's friend now :D :D :D ");
			}
		}
		else if (input === "!nibblenibble")
		{
			if (message.member.roles.has(gobborole))
			{
				message.member.removeRole(gobborole).then(console.log).catch(console.error);
				message.reply("hates gobbo ;;;-;;; ");
			}
			else
			{
				message.reply("is already dead to gobbo. ");
			}
		}
		else if (input === "!help")
		{
			message.reply(
				{
					embed:
						{
							color: 3447003,
							title: "Available Commands:",
							fields: [
								{ name: "!ping", value: "Check if Gobbo is alive"},
								{ name: "!when", value: "Get closest boss' spawn time"},
								{ name: "!when <boss>", value: "Get relevant boss' spawn time"},
								{ name: "!when table", value: "Show boss table"},
								{ name: "!gobblegobble", value: "Become Gobbo's friend for boss spawn alerts"},
								{ name: "!nibblenibble", value: "Break Gobbo's heart and remove boss spawn alerts"},
								{ name: "!whatislove", value: "What is LOVE"},
								{ name: "!gimmegimme", value: "Gimme"},
								{ name: "!love", value: "L-Love??"},
								{ name: "!poke", value: "No touching!"},
								{ name: "!pet", value: "Will you?"},
								{ name: "!sogood", value: "Praise~"},
								{ name: "!notify", value: "Show the entire notifications list"},
								{ name: "!notify clear", value: "Clear notifications list"},
								{ name: "!notify <registration_minute>;<reminder>", value: "Save a notification in gobbo that will be alerted 14 minutes from <registration_minute>, can also save several notifications separated by comma. If no minute is specified it will default to the current minute."}
							]
						}
				}
			)
		}
	}
);

bot.login(auth.token);
