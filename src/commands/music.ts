import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";
import * as _ from "lodash";

export const joinCommand = `${process.env.PREFIX}join`;
export const playCommand = `${process.env.PREFIX}play`;
export const stopCommand = `${process.env.PREFIX}stop`;
export const skipCommand = `${process.env.PREFIX}skip`;
export const queueCommand = `${process.env.PREFIX}queue`;
export const leaveCommand = `${process.env.PREFIX}leave`;

let playQueue: string[] = [];

//  JOIN COMMAND
export async function handleJoinCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  } else {
    return await message.member.voiceChannel.join();
  }
}

//  PLAY COMMAND
export async function handlePlayCommand(message: discord.Message) {
  const query = message.content.substring(playCommand.length).trim();
  const validate = await ytdl.validateURL(query);

  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  } else if (!query) {
    return await message.channel.send(
      `**If you want me to play a song please provide me with a URL!**`
    );
  } else if (!validate) {
    return await message.channel.send(
      `**Please provide me a VALID URL of what you want me to play!**`
    );
  }
  const info = await ytdl.getInfo(query);
  const connection = await message.member.voiceChannel.join();

  playQueue.push(query);

  if (playQueue.length > 1) {
    return await message.channel.send(
      `**${info.title} has been added to the queue!**`
    );
  }

  const dispatch = () => {
    const stream = connection.playStream(
      ytdl(playQueue[0], {
        filter: "audioonly",
        quality: "highestaudio",
      })
    );

    stream.on("end", () => {
      playQueue = _.drop(playQueue, 1);
      if (!_.isEmpty(playQueue)) {
        //  called again if there are still songs to play
        dispatch();
      }
    });

    stream.setVolume(0.2);
  };

  dispatch();

  await message.channel.send(`**Now playing: ${info.title}**`);
}

//  STOP COMMAND
export async function handleStopCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(
      `**I'm not currently connected to a channel!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  }

  const dispatcher = message.guild.voiceConnection.dispatcher;

  if (dispatcher) {
    dispatcher.end();
    await message.channel.send(`**Music has been stopped!**`);
  } else {
    return await message.channel.send(
      `**I'm not currently playing any music!**`
    );
  }
}

//  SKIP COMMAND
export async function handleSkipCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(
      `**I'm not currently connected to a channel!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  }
  const dispatcher = message.guild.voiceConnection.dispatcher;

  if (!dispatcher) {
    return await message.channel.send(
      `**I'm not currently playing any music!**`
    );
  }

  dispatcher.end();
}

//  QUEUE COMMAND
export async function handleQueueCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(
      `**I'm not currently connected to a channel!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  }
  const nowPlaying = await ytdl.getInfo(playQueue[0]);

  message.channel.send(`**Currently playing:**\n*${nowPlaying.title}*\n`);

  message.channel.send(`**Queue:**\n`);
  for (var i = 1; i < playQueue.length; i++) {
    const info = await ytdl.getInfo(playQueue[i]);
    message.channel.send(`*${info.title}*`);
  }
}

//  LEAVE COMMAND
export async function handleLeaveCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(
      `**I'm not currently connected to a channel!**`
    );
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  }
  message.guild.me.voiceChannel.leave();
  return await message.channel.send(`**See you next time!**`);
}
