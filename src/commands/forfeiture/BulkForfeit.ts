import { Message, MessageReaction, User } from "discord.js";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["bulkforfeit", "bff"];
  exec = async (msg: Message, executor: Profile) => {
    /*let starCount = parseInt(this.options[0]?.split("<")[1]);

    if (isNaN(starCount)) {
      msg.channel.send(
        "<:red_x:741454361007357993> Please enter a valid constraint (`stars<#`, where # is a number 2 to 7)"
      );
      return;
    }
    if (starCount < 2) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a valid "less than star count" (any number greater than 2)`
      );
      return;
    }

    let conf = await msg.channel.send(
      `:warning: Really forfeit **all cards under ${starCount} stars**?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
    );
    conf.react("✅");
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
        executor,
        starCount
      );

      msg.channel.send(
        `:white_check_mark: You forfeited **${bulk}** cards :wave:.`
      );
      conf.delete();
    } else {
      conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the forfeiture has been cancelled.`
      );
      conf.reactions.removeAll();
    }*/
  };
}
