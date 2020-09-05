import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageReaction, User } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends GameCommand {
  names: string[] = ["bulkforfeit", "bff"];
  usage: string[] = ["%c < stars<# >"];
  desc: string = "Forfeits all cards under a certain star count.";
  category: string = "card";

  exec = async (msg: Message) => {
    let starCount = parseInt(this.prm[0]?.split("<")[1]);

    if (isNaN(starCount)) {
      await msg.channel.send(
        "<:red_x:741454361007357993> Please enter a valid constraint (`stars<#`, where # is a number 2 to 7)"
      );
      return;
    }
    if (starCount < 2) {
      await msg.channel.send(
        `<:red_x:741454361007357993> Please enter a valid "less than star count" (any number greater than 2)`
      );
      return;
    }

    let conf = await msg.channel.send(
      `:warning: Really forfeit **all cards under ${starCount} stars**?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
    );
    await conf.react("✅");
    let filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name == "✅" && user.id == msg.author.id;
    };
    let reactions = await conf.awaitReactions(filter, {
      max: 1,
      time: 10000,
    });
    let rxn = reactions.first();

    if (rxn) {
      let bulk = await UserCardService.forfeitBulkUnderStars(
        msg.author.id,
        starCount
      );

      await msg.channel.send(
        `:white_check_mark: You forfeited **${bulk}** cards :wave:.`
      );
      await conf.delete();
    } else {
      await conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the forfeiture has been cancelled.`
      );
      await conf.reactions.removeAll();
    }
    return;
  };
}