import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/player/Player";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["hug"];
  usage: string[] = ["%c <mention>"];
  desc: string =
    "Hugs somebody, giving both of you 3 hearts. There is a delay of 4 hours until you can hug the same person again.";
  category: string = "player";

  exec = async (msg: Message) => {
    let v = msg.mentions.users.first();
    let user = await PlayerService.hugUser(msg.author.id, v?.id);

    let userString = msg.guild?.member(v!)?.displayName || v?.username;
    if (user === 0) {
      await msg.channel.send(
        `:heart: **You gave a hug to ${userString}**!\nYou haven't set up a profile, so no hearts were given.`
      );
      return;
    } else if (user === 1) {
      await msg.channel.send(
        `:heart: **You gave a hug to ${userString}**!\nThey haven't set up a profile, so no hearts were given.`
      );
      return;
    } else if (user === 2) {
      await msg.channel.send(`:heart: **You gave a hug to ${userString}**!`);
      return;
    } else if (user > 2) {
      await msg.channel.send(
        `:broken_heart: You will be able to hug **${userString}** again in **${moment(
          user
        ).diff(Date.now(), "hours")} hours**.`
      );
      return;
    }
    await msg.channel.send(`Something went wrong.`);
    return;
  };
}
