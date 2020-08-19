import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["hug"];
  usage: string[] = ["%c <mention>"];
  desc: string = "Hugs somebody, giving both of you 3 hearts.";
  category: string = "player";

  exec = async (msg: Message) => {
    let v = msg.mentions.users.first();
    let user = await PlayerService.hugUser(msg.author.id, v?.id);

    let userString = msg.guild?.member(v!)?.displayName || v?.username;
    if (user === 0) {
      await msg.channel.send(
        `:heart: **You gave a hug to ${userString}**!\nYou haven't set up a profile, so they did not gain hearts from this.`
      );
      return;
    } else if (user === 1) {
      await msg.channel.send(
        `:heart: **You gave a hug to ${userString}**!\nThey haven't set up a profile, so they did not gain hearts from this.`
      );
      return;
    } else if (user === 2) {
      console.log(v);
      await msg.channel.send(`:heart: **You gave a hug to ${userString}**!`);
      return;
    }
    await msg.channel.send(`Something went wrong.`);
    return;
  };
}
