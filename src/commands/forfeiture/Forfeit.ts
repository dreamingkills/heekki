import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["forfeit", "ff"];
  usage: string[] = ["%c <card reference>"];
  desc: string =
    "Removes a card from your inventory, making it available to anyone.";
  category: string = "card";

  exec = async (msg: Message) => {
    let card = await CardService.parseCardDetails(this.prm[0]);

    let conf = await msg.channel.send(
      `:warning: Really forfeit **${card.card.abbreviation}#${card.card.serialNumber}**?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
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
      await PlayerService.forfeitCard(msg.author.id, this.prm[0]);

      await msg.channel.send(
        `:white_check_mark: You forfeited **${card.card.abbreviation}#${card.card.serialNumber}**.`
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
