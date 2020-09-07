import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";

export class Command extends GameCommand {
  names: string[] = ["chad"];
  usage: string[] = ["%c"];
  desc: string = "Shows current LOONA standings on Choeaedol.";
  category: string = "player";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    let ids = {
      615: "TWICE",
      703: "BLACKPINK",
      445: "Red Velvet",
      529: "GFRIEND",
      100196: "IZ*ONE",
      476: "MAMAMOO",
      100123: "DREAMCATCHER",
      100144: "LOONA",
      100228: "ITZY",
      100114: "(G)I-DLE",
      100347: "NATURE",
      754: "MOMOLAND",
      582: "April",
      411: "Apink",
      545: "OH MY GIRL",
      412: "GIRLS' GENERATION",
      662: "WJSN",
      100390: "Weeekly",
      530: "Lovelyz",
      100091: "fromis_9",
      458: "AOA",
      100037: "Weki Meki",
    };
    let url =
      "https://www.myloveidol.com/api/v1/idols/?type=G&category=F&fields=heart,top3";
    let response = await fetch(url);
    let json = await response.json();
    let groups = json.objects;
    let desc = "";
    for (let i = 0; i < groups.length; i++) {
      let cur = ids[groups[i].id as keyof typeof ids];
      desc += `**${i + 1}**) ${
        (cur == "LOONA" ? "__" : "") + cur + (cur == "LOONA" ? "__" : "")
      } - **${groups[i].heart}** :heart:\n`;
    }
    let embed = new MessageEmbed()
      .setAuthor(`Current Choeaedol standings (${groups.length} groups)`)
      .setDescription(desc)
      .setColor("#40BD66");
    msg.channel.send(embed);
  };
}
