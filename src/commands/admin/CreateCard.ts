import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/shop/Shop";
import { PlayerService } from "../../database/player/Player";
import { AdminService } from "../../database/admin/Admin";

export class Command extends GameCommand {
  names: string[] = ["createcard"];
  usage: string[] = ["%c <imageUrl> <member> <rarity> <collectionId> <credit>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;
    let [url, member, rarity, collectionId, credit] = this.prm;
    let card = await AdminService.createNewCard(
      url,
      member,
      rarity,
      collectionId,
      credit
    );

    msg.channel.send(
      `:white_check_mark: **Created new Card** \`${card.member}\`\nCollection: ${card.collection.name}\nID: ${card.id}`
    );
    return;
  };
}
