import * as discord from "discord.js";
// import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";
import * as _ from "lodash";

export const joinCommands = ["join", "j", "connect"];
export const playCommands = ["play", "p"];
export const stopCommands = ["stop", "st"];
export const skipCommands = ["skip", "sk"];
export const queueCommands = ["queue", "q"];
export const leaveCommands = ["leave", "l", "exit", "disconnect"];

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
export async function handlePlayCommand(
  message: discord.Message,
  query: string
) {
  const validate = ytdl.validateURL(query);

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

  if (playQueue.length > 0) {
    playQueue = [];
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
  const queue = await Promise.all(
    _.map(_.drop(playQueue, 1), async (song) => {
      const info = await ytdl.getInfo(song);
      return info.title;
    })
  );

  message.channel.send(
    `**Currently playing:**\n\t*${nowPlaying.title}*\n**Queue:**\n\t*${queue}*`
  );
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
