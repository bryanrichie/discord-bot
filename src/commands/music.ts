import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";

export const joinCommand = `${process.env.PREFIX}join`;
export const playCommand = `${process.env.PREFIX}play`;
export const stopCommand = `${process.env.PREFIX}stop`;
export const leaveCommand = `${process.env.PREFIX}leave`;

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
  const dispatcher = await connection.playStream(
    ytdl(query, {
      filter: "audioonly",
    })
  );
  return await message.channel.send(`**Now playing: ${info.title}**`);
}

//  STOP COMMAND
export async function handleStopCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(`**I'm not currently in a channel!**`);
  } else if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  ) {
    return await message.channel.send(
      `**Sorry, I'm currently being used already!**`
    );
  }

  const dispatcher = await message.guild.voiceConnection.dispatcher;

  if (dispatcher) {
    dispatcher.end();
    return await message.channel.send(`**Music has been stopped!**`);
  } else {
    return await message.channel.send(
      `**I'm not currently playing any music!**`
    );
  }
}

//  LEAVE COMMAND
export async function handleLeaveCommand(message: discord.Message) {
  if (!message.member.voiceChannel) {
    return await message.channel.send(
      `**Please connect to a voice channel to use this command!**`
    );
  } else if (!message.guild.me.voiceChannel) {
    return await message.channel.send(`**I'm not currently in a channel!**`);
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
