import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";
import { config } from "dotenv";

import { gifCommand, handleGifCommand } from "./commands/gif";
import { kickCommand, handleKickCommand } from "./commands/kick";

const client = new discord.Client();
config();

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnecting", () => {
  console.log("Disconnecting!");
});

client.on("message", async message => {
  if (message.content.startsWith(kickCommand)) {
    await handleKickCommand(message);
  }

  if (message.content.startsWith(gifCommand)) {
    await handleGifCommand(message);
  }
});

// music bot feature
const queue = new Map();

async function handlePlayCommand(message: discord.Message, query: string) {
  const results = await youtubeSearch(query, opts);
  if (results) {
    const youtubeResults = results.results;
    const titles = youtubeResults.map((result, index) => {
      return `${index + 1}) ${result.title}`;
    });

    message.channel.send({
      embed: {
        title: "Song selection. Type the song number to continue.",
        description: titles.join("\n")
      }
    });

    const filter = (m: any) => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages(filter, {
      max: 1
    });

    const selected = youtubeResults[parseInt(collected.first().content) - 1];
  }
}

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(`${process.env.PREFIX}`)) return;

  const serverQueue = queue.get(message.guild.id);

  const playCommand = `${process.env.PREFIX}play`;
  const skipCommand = `${process.env.PREFIX}skip`;
  const stopCommand = `${process.env.PREFIX}stop`;
  const queueCommand = `${process.env.PREFIX}queue`;

  if (message.content.startsWith(playCommand)) {
    const selected = handlePlayCommand;
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(skipCommand)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(stopCommand)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(queueCommand)) {
    queueList(message, serverQueue);
    return;
  }
});

async function execute(message: discord.Message, serverQueue: any) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voiceChannel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (
    permissions &&
    (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
  ) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1], {
    filter: "audioonly"
  });
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };
  //  here we try to join the voice chat and save our connection into our object
  const connection = await voiceChannel.join();

  if (!serverQueue) {
    //  creating the contract for our queue
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel,
      connection,
      songs: [song],
      volume: 5,
      playing: true
    };

    //  setting the queue using our contract
    queue.set(message.guild.id, queueConstruct);

    try {
      //  calling the play function to start a song
      play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      //  printing the error message if the bot fails to join the voice chat
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function play(guild: any, song: any) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on("end", () => {
      console.log("Music has ended!");
      //  deletes the finished song from the queue
      serverQueue.songs.shift();
      //  calls the play function again with the next song
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error: any) => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function skip(message: discord.Message, serverQueue: any) {
  if (!serverQueue) {
    return message.channel.send("There is currently no song for me to skip!");
  } else if (message.member.voiceChannel !== message.guild.me.voiceChannel) {
    return message.channel.send(
      "You have to be in the same voice channel as me to skip the song!"
    );
  }
  message.channel.send(`${serverQueue.songs[0].title} has been skipped!`);
  serverQueue.connection.dispatcher.end();
}

function stop(message: discord.Message, serverQueue: any) {
  if (!serverQueue) {
    return message.channel.send("There is currently no song queue!");
  } else if (message.member.voiceChannel !== message.guild.me.voiceChannel) {
    return message.channel.send(
      "You have to be in the same voice channel as me to stop the song!"
    );
  }
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  return message.channel.send("The current song queue has been stopped, bye!");
}

function queueList(message: discord.Message, serverQueue: any) {
  if (!serverQueue) message.channel.send("There are no songs in queue!");
  serverQueue.songs.forEach((song: any) => {
    return message.channel.send(song.title);
  });
}

const opts = {
  maxResults: 5,
  key: `${process.env.YOUTUBE_TOKEN}`,
  type: "video"
};

client.login(`${process.env.DISCORD_TOKEN}`);
