import * as discord from "discord.js";
import { google } from "googleapis";
import * as ytdl from "ytdl-core";
import * as _ from "lodash";

export const joinCommands = ["join", "j", "connect"];
export const playCommands = ["play", "p"];
export const searchCommands = ["search", "s"];
export const stopCommands = ["stop", "st"];
export const skipCommands = ["skip", "sk"];
export const queueCommands = ["queue", "q"];
export const leaveCommands = ["leave", "l", "exit", "disconnect"];

let playQueue: string[] = [];
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_TOKEN,
});

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

  const dispatch = async () => {
    const stream = connection.playStream(
      ytdl(playQueue[0], {
        filter: "audioonly",
        quality: "highestaudio",
      })
    );

    stream.on("end", async () => {
      playQueue = _.drop(playQueue, 1);
      if (!_.isEmpty(playQueue)) {
        const nowPlaying = await ytdl.getInfo(playQueue[0]);
        dispatch();
        message.channel.send(`**Now playing: ${nowPlaying.title}**`);
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
      return `${info.title}\n`;
    })
  );

  const embed = new discord.RichEmbed({
    title: "Queue",
    color: 0x73ffdc,
    fields: [
      {
        name: "**Currently Playing:**",
        value: nowPlaying.title,
      },
      {
        name: "**Upcoming:**",
        value: `${queue}`,
      },
    ],
  });

  message.channel.send(embed);
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

//  SEARCH COMMAND
export async function handleSearchCommand(
  message: discord.Message,
  query: string
) {
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
  }

  let q = query;

  if (!query) {
    const embed = new discord.RichEmbed()
      .setColor("#73ffdc")
      .setDescription(
        "Please enter a search query. Remember to narrow down your search!"
      )
      .setTitle("Youtube Search");

    await message.channel.send(embed);

    const filter = (m: discord.Message) => m.author.id === message.author.id;
    const queries = await message.channel.awaitMessages(filter, {
      max: 1,
    });
    q = queries.values().next().value.content;
  }

  const videoSearch = await youtube.search.list({
    part: ["snippet"],
    type: ["video"],
    q,
    maxResults: 5,
  });

  const results = await youtube.videos.list({
    part: ["contentDetails", "snippet"],
    id: _.compact(_.map(videoSearch.data.items, (item) => item.id?.videoId)),
  });

  const youtubeResults = results.data.items;

  const titles = _.map(youtubeResults, (result, index) => {
    return index + 1 + ") " + result.snippet?.title;
  });

  if (youtubeResults === undefined) {
    return await message.channel.send(
      "There were no results for your search. Please try again."
    );
  }

  message.channel.send({
    embed: {
      title:
        "Select which song you want to play by typing the corresponding number!",
      description: titles.join("\n"),
    },
  });

  const collected = await message.channel.awaitMessages(
    (m: discord.Message) => m.author.id === message.author.id,
    {
      maxMatches: 1,
    }
  );

  const collectedAsInt = _.parseInt(collected.values().next().value.content);

  if (
    collectedAsInt < 1 ||
    collectedAsInt > 5 ||
    !_.isInteger(collectedAsInt)
  ) {
    return await message.channel.send(
      "Please enter a valid number according to the song that you want to play!"
    );
  }

  const selectedSong = youtubeResults[collectedAsInt - 1];

  const embed = new discord.RichEmbed()
    .setColor("#73ffdc")
    .setTitle(`${selectedSong.snippet?.title}`)
    .setURL(`https://www.youtube.com/watch?v=${selectedSong.id}`)
    .setThumbnail(`${selectedSong.snippet?.thumbnails?.maxres?.url}`);

  message.channel.send(embed);

  const connection = await message.member.voiceChannel.join();

  playQueue.push(`https://www.youtube.com/watch?v=${selectedSong.id}`);

  if (playQueue.length > 1) {
    return await message.channel.send(
      `**${selectedSong.snippet?.title} has been added to the queue!**`
    );
  }

  const dispatch = () => {
    const stream = connection.playStream(
      ytdl(playQueue[0], {
        filter: "audioonly",
        quality: "highestaudio",
      })
    );

    stream.on("end", async () => {
      playQueue = _.drop(playQueue, 1);
      if (!_.isEmpty(playQueue)) {
        const nowPlaying = await ytdl.getInfo(playQueue[0]);
        dispatch();
        message.channel.send(`**Now playing: ${nowPlaying.title}**`);
      }
    });

    stream.setVolume(0.2);
  };

  dispatch();

  await message.channel.send(`**Now playing: ${selectedSong.snippet?.title}**`);
}
