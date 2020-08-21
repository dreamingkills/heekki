import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/shop/Shop";
import { PlayerService } from "../../database/player/Player";
import { AdminService } from "../../database/admin/Admin";
import { AdminCommand } from "../../structures/command/AdminCommand";

export class Command extends AdminCommand {
  names: string[] = ["createcollection"];
  usage: string[] = [
    "%c <collection name> <fontName> <collectionSize> <collectionColor> <collectionAlign> <collectionPosX> <collectionPosY> <memberSize> <memberColor> <memberAlign> <memberPosX> <memberPosY> <serialSize> <serialColor> <serialAlign> <serialPosX> <serialPosY> <levelTextSize> <levelTextColor> <levelTextAlign> <levelTextPosX> <levelTextPosY> <levelNumSize> <levelNumColor> <levelNumAlign> <levelNumPosX> <levelNumPosY> <heartSize> <heartColor> <heartAlign> <heartPosX> <heartPosY> <heartURL> [<starXPosX> <starXPosY> <starXHeight> <starXWidth> x6]",
  ];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;

    let coll = await AdminService.createNewCollection(this.prm);

    msg.channel.send(
      `:white_check_mark: **Created new Collection** \`${coll.name}\`\nID: ${coll.id}`
    );
    return;
  };
}
