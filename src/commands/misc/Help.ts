import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["help", "docs"];
  async exec(msg: Message): Promise<void> {
    const topic = this.options.join(" ").toLowerCase();
    let header;
    let description;
    let footer = "";

    switch (topic) {
      case "overview":
      case "": {
        header = "Overview";
        description =
          `\nHeekki can be a complex bot, so we've created a help center to help reduce confusion and avoid having to go to external websites or servers.\n` +
          `\n**Popular Topics**` +
          `\n\`\`\`` +
          `\n!help cash` +
          `\n!help friends` +
          `\n!help hearts` +
          `\n!help xp` +
          `\n!help marketplace` +
          `\n!help trading` +
          `\n\`\`\`` +
          `\nYou can use \`!help topics\` to see a complete list.\n` +
          `\n:warning: **Find a bug? Need further help?**` +
          `\nYou can submit a ticket with \`!ticket <your problem>\`.` +
          `\nYou can also attach an image to your ticket.` +
          `\n:scientist: **Official Heekki Server**` +
          `\nhttps://discord.gg/KbcQjRG`;
        break;
      }
      case "topics": {
        header = "Topics";
        description =
          `You can use \`!help <topic>\` to learn more information about something!\n` +
          `\n__**Profile**__` +
          `\n\`friends\`, \`hearts\`, \`xp\`\n` +
          `\n__**Economy**__` +
          `\n\`cash\`, \`marketplace\`, \`trading\`, \`missions\`\n`;
        break;
      }
      case "missions": {
        header = "Missions";
        description =
          `**Missions** are time-based events that reward you with money and XP.\nHowever, there's a catch - you can fail missions too.\n` +
          `\n__**How do I do a mission?**__` +
          `\nSimply use \`!mission <card>\` - example: \`!mission DLHJ#6\`\n` +
          `\n__**Can I get more money for missions?**__` +
          `\nMission rewards scale with the level of your card.`;
        break;
      }
      case "cash": {
        header = "Cash";
        description =
          `<:cash:757146832639098930> **Cash** is used to buy cards both from the Marketplace and from packs.\n` +
          `\n__**How do I gain cash?**__` +
          `\n**1)** Use \`!mission\` on a card every 45 minutes` +
          `\n**2)** Go \`!fishing\` (use \`!fish sell\`)` +
          `\n**3)** \`!sell\` your cards on the Marketplace`;
        break;
      }
      case "friends": {
        header = "Friends";
        description =
          `You can send and receive hearts to and from your Heekki friends.\n` +
          `\n**Command List**` +
          `\n\`\`\`` +
          `\n!friend add <user> - Sends/accepts a friend request` +
          `\n!friend remove <user> - Removes a friend` +
          `\n!friend list - Shows all your friends` +
          `\n!friend requests - Shows incoming friend requests` +
          `\n\`\`\`` +
          `\n**Sending Hearts**` +
          `\nTo send hearts to your friends, you can use \`!send\` once per hour. Hearts that your friends have sent to you will automatically be deposited into your profile!`;
        break;
      }
      case "hearts": {
        header = "Hearts";
        description =
          `<:heekki_heart:757147742383505488> **Hearts** are used to level up your cards.` +
          `\nYour card will level up once every 150 hearts!\n` +
          `\n__**How do I gain hearts?**__` +
          `\n**1)** Every 4 hours, you can use \`!hb\` to receive a random amount of hearts.` +
          `\n**2)** Your friends can send you hearts.\n` +
          `\n__**How do I use hearts?**__` +
          `\nYou can upgrade your cards by using \`!upgrade <card> <amount>\`.` +
          `\nExample: \`!upgrade DLHJ#32 300\``;
        break;
      }
      case "xp": {
        header = "XP";
        description =
          `**Experience points (XP)** are gained by completing various tasks and activities on Heekki.\n` +
          `\n__**What does XP do?**__` +
          `\nExperience points do not currently do anything.\n` +
          `\n__**Who has the most XP?**__` +
          `\nYou can see the top users by XP by using \`!top xp\`!`;
        break;
      }
      case "mp":
      case "marketplace": {
        header = "Marketplace";
        description =
          `The **Marketplace** (MP) is a place where you can sell your cards to other users for <:cash:757146832639098930> Cash.\n` +
          `\n**Command List**` +
          `\n\`\`\`` +
          `\n!mp - Shows you the MP.` +
          `\n!mp <@user> - Shows you the cards someone is selling.` +
          `\n!mp sell <card> <price> - Lists a card on MP.` +
          `\n!mp unsell <card> - Removes a card listing from the MP.` +
          `\n!mp buy <card> - Buys a card from the MP.` +
          `\n\`\`\``;
        break;
      }
      case "trading": {
        header = "Trading";
        description =
          `**Trading** is a means to exchange cards between you and someone else.\n` +
          `\n__**How do I trade?**__` +
          `\nTo begin trading with someone, simply type \`!trade <@user>\`. The bot will then guide you through the following steps:` +
          `\n**1)** Enter up to five of **your cards** (type OK if you have less than 5 cards)` +
          `\n**2)** Whoever you're trading with enters up to five of **their cards** (again, type OK if there are less than 5 cards)` +
          `\n**3)** Both of you will confirm the trade.` +
          `\n**4)** Success!\n` +
          `\n__**Can I reverse a trade?**__` +
          `\nNo, you cannot reverse a trade; be careful who you're trading with!`;
        break;
      }
      default: {
        header = "Error";
        description =
          `\nSorry, I couldn't find that topic.` +
          `\nUse \`!help topics\` to see a list of topics.`;
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(
        `Help Center - ${header} | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(description)
      .setFooter(footer)
      .setColor(`#FFAACC`);
    msg.channel.send(embed);
  }
}
