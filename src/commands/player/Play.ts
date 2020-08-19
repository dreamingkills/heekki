import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";

export class Command extends GameCommand {
  names: string[] = ["play"];
  usage: string[] = ["%c"];
  desc: string = "Creates a new profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let user = await this.entities.user.findOne({
      discord_id: msg.author.id,
    });
    //Validate whether or not user exists
    if (user) {
      await msg.channel.send(
        "<:red_x:741454361007357993> You have already created a profile!"
      );
      return;
    }

    let newUser = this.entities.user.create();
    newUser.discord_id = msg.author.id;
    await newUser.save();

    await msg.channel.send(
      ":white_check_mark: A profile was successfully created for you!"
    );
    return;
  };
}
