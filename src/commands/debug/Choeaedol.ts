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
    const ids = {
      411: "Apink",
      412: "GIRLS' GENERATION",
      445: "Red Velvet",
      458: "AOA",
      476: "MAMAMOO",
      529: "GFRIEND",
      530: "Lovelyz",
      545: "OH MY GIRL",
      582: "April",
      615: "TWICE",
      662: "WJSN",
      703: "BLACKPINK",
      754: "MOMOLAND",
      100037: "Weki Meki",
      100091: "fromis_9",
      100114: "(G)I-DLE",
      100123: "DREAMCATCHER",
      100144: "LOONA",
      100196: "IZ*ONE",
      100228: "ITZY",
      100347: "NATURE",
      100390: "Weeekly",
      members: {
        100145: "HeeJin",
        100146: "HyunJin",
        100147: "HaSeul",
        100148: "YeoJin",
        100149: "Vivi",
        100150: "Kim Lip",
        100151: "JinSoul",
        100152: "Choerry",
        100153: "Yves",
        100154: "Chuu",
        100155: "Go Won",
        100156: "Olivia Hye",
      },
    };
    const url =
      "https://www.myloveidol.com/api/v1/idols/?type=G&category=F&fields=heart,top3";
    const mUrl =
      "https://www.myloveidol.com/api/v1/idols/?type=S&category=F&fields=heart,top3";
    let response = await fetch(url);
    const mResponse = await fetch(mUrl);
    let json = await response.json();
    const mJson = await mResponse.json();
    const groups = json.objects;
    const members = mJson.objects;
    let memberDesc = "";
    let loonaRank = 0;
    for (let group of groups) {
      const cur = ids[group.id as keyof typeof ids];
      if (group.id === 100144) loonaRank = parseInt(groups.indexOf(group) + 1);
    }
    for (let member of members) {
      const cur = ids.members[member.id as keyof typeof ids.members];
      if (cur) {
        memberDesc += `**${members.indexOf(member) + 1}**) ${cur} - **${
          member.heart
        }** :heart:\n`;
      }
    }
    let embed = new MessageEmbed()
      .setAuthor(
        `Current Choeaedol standings (${groups.length} groups, ${members.length} members)`
      )
      .setDescription(
        `LOONA is currently rank **${loonaRank}** for girl groups.`
      )
      .addField(`Member Rankings`, memberDesc, true)
      .setColor("#40BD66");
    msg.channel.send(embed);
  };
}
