import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["help", "docs"];
  async exec(msg: Message): Promise<void> {
    const topic = this.options.join(" ").toLowerCase();
    let header;
    let description;
    let footer = "";
    let prefix = this.bot.getPrefix(msg.guild?.id);

    switch (topic) {
      case "commands": {
        header = "Commands";
        description =
          `**Games**` +
          `\n\`${prefix}jumble\`, \`${prefix}trivia\`, \`${prefix}memory\`\n` +
          `\n**Profile**` +
          `\n\`${prefix}profile\`, \`${prefix}desc\`, \`${prefix}rep\`,  \`${prefix}unrep\`, \`${prefix}inv\`, \`${prefix}timers\`, \`${prefix}use\`, \`${prefix}using\`, \`${prefix}friend\`\n` +
          `\n**Cards / Packs**` +
          `\n\`${prefix}packs\`, \`${prefix}pack\`, \`${prefix}preview\`, \`${prefix}view\`, \`${prefix}fav\`, \`${prefix}upgrade\`, \`${prefix}prestige\`, \`${prefix}gift\`, \`${prefix}buypack\`, \`${prefix}marketplace\`, \`${prefix}trade\`\n` +
          `\n**Time-Based**` +
          `\n\`${prefix}daily\`, \`${prefix}mission\`, \`${prefix}send\`, \`${prefix}hb\`\n` +
          `\n**Other**` +
          `\n\`well\`, \`${prefix}help\`, \`${prefix}invite\`, \`${prefix}stats\`, \`${prefix}ticket\`, \`${prefix}top\`\n`;
        break;
      }
      case "overview":
      case "": {
        header = "Overview";
        description =
          `\nHeekki can be a complex bot, so we've created a help center to help reduce confusion and avoid having to go to external websites or servers.\n` +
          `\n**Popular Topics**` +
          `\n\`\`\`` +
          `\n${prefix}help cash` +
          `\n${prefix}help cards` +
          `\n${prefix}help friends` +
          `\n${prefix}help hearts` +
          `\n${prefix}help xp` +
          `\n${prefix}help marketplace` +
          `\n${prefix}help trading` +
          `\n${prefix}help prefix` +
          `\n\`\`\`` +
          `\nYou can use \`${prefix}help topics\` to see a complete list.` +
          `\nYou can use \`${prefix}help commands\` to see a command list.\n` +
          `\n:warning: **Find a bug? Need further help?**` +
          `\nYou can submit a ticket with \`${prefix}ticket <your problem>\`.` +
          `\nYou can also attach an image to your ticket.` +
          `\n:scientist: **Official Heekki Server**` +
          `\nhttps://discord.gg/KbcQjRG`;
        break;
      }
      case "badges": {
        header = "Badges";
        description =
          `Badges are given to users who have accomplished something notable on Heekki.\n` +
          `\n**Badge List**` +
          `\n:tools: **Developer** (write code for Heekki)` +
          `\n:zap: **Beta Tester** (play before 200906)` +
          `\n:100: **First 100 Players**` +
          `\n:art: **Artist** (make a card pack for Heekki)` +
          `\n:heart: **Supporter** (on Patreon)`;
        break;
      }
      case "topics": {
        header = "Topics";
        description =
          `You can use \`${prefix}help <topic>\` to learn more information about something${prefix}\n` +
          `\n__**Profile**__` +
          `\n\`profile\`, \`friends\`, \`hearts\`, \`xp\`\n` +
          `\n__**Economy**__` +
          `\n\`cash\`, \`marketplace\`, \`trading\`, \`missions\`, \`cards\`\n`;
        break;
      }
      case "cards": {
        header = "Cards";
        description =
          `**Cards** are the main focus of Heekki - images with various designs about LOONA${prefix}\n` +
          `\n__**How do I get cards?**__` +
          `\n**1)** Use \`${prefix}daily\` once per day for a free card` +
          `\n**2)** Use \`${prefix}bp <pack>\` to buy a random card from a pack - use \`${prefix}packs\` to see all packs` +
          `\n**3)** \`${prefix}trade\` with other players` +
          `\n**4)** Purchase from the Marketplace (\`${prefix}mp\`)\n` +
          `\n__**What do stars do?**__` +
          `\nStars increase the success rate and reward of missions.` +
          `\nHigher stars are rarer, but you can add a star to your card at level 99 by using \`${prefix}prestige <card>\`${prefix}`;
        break;
      }
      case "profile": {
        header = "Profile";
        description =
          `Your **Profile** displays information about you, including how many hearts, cards, cash, and reputation you have.\n` +
          `\n__**How do I set my description?**__` +
          `\nYou can use \`${prefix}desc description goes here${prefix}\` to set your description.`;
        break;
      }
      case "mission":
      case "missions": {
        header = "Missions";
        description =
          `**Missions** are time-based events that reward you with money and XP.\nHowever, there's a catch - you can fail missions too.\n` +
          `\n__**How do I do a mission?**__` +
          `\nSimply use \`${prefix}mission <card>\` - example: \`${prefix}mission DLHJ#6\`\n` +
          `\n__**Can I get more money for missions?**__` +
          `\nMission rewards scale with the level of your card.`;
        break;
      }
      case "cash": {
        header = "Cash";
        description =
          `${this.config.discord.emoji.cash.full} **Cash** is used to buy cards both from the Marketplace and from packs.\n` +
          `\n__**How do I gain cash?**__` +
          `\n**1)** Use \`${prefix}mission\` on a card every 45 minutes` +
          `\n**2)** Play minigames - \`${prefix}jumble\`, \`${prefix}memory\`` +
          `\n**3)** \`${prefix}sell\` your cards on the Marketplace`;
        break;
      }
      case "friend":
      case "friends": {
        header = "Friends";
        description =
          `You can send and receive hearts to and from your Heekki friends.\n` +
          `\n**Command List**` +
          `\n\`\`\`` +
          `\n${prefix}friend add <user> - Sends/accepts a friend request` +
          `\n${prefix}friend remove <user> - Removes a friend` +
          `\n${prefix}friend list - Shows all your friends` +
          `\n${prefix}friend requests - Shows incoming friend requests` +
          `\n\`\`\`` +
          `\n**Sending Hearts**` +
          `\nTo send hearts to your friends, you can use \`${prefix}send\` once per hour. Hearts that your friends have sent to you will automatically be deposited into your profile${prefix}`;
        break;
      }
      case "hearts": {
        header = "Hearts";
        description =
          `${this.config.discord.emoji.hearts.full} **Hearts** are used to level up your cards.` +
          `\nYour card will level up once every 150 hearts${prefix}\n` +
          `\n__**How do I gain hearts?**__` +
          `\n**1)** Every 4 hours, you can use \`${prefix}hb\` to receive a random amount of hearts.` +
          `\n**2)** Your friends can send you hearts.\n` +
          `\n__**How do I use hearts?**__` +
          `\nYou can upgrade your cards by using \`${prefix}upgrade <card> <amount>\`.` +
          `\nExample: \`${prefix}upgrade DLHJ#32 300\``;
        break;
      }
      case "market":
      case "mp":
      case "marketplace": {
        header = "Marketplace";
        description =
          `The **Marketplace** (MP) is a place where you can sell your cards to other users for ${this.config.discord.emoji.cash.full} Cash.\n` +
          `\n**Command List**` +
          `\n\`\`\`` +
          `\n${prefix}mp - Shows you the MP.` +
          `\n${prefix}mp <@user> - Shows you the cards someone is selling.` +
          `\n${prefix}mp sell <card> <price> - Lists a card on MP.` +
          `\n${prefix}mp unsell <card> - Removes a card listing from the MP.` +
          `\n${prefix}mp buy <card> - Buys a card from the MP.` +
          `\n\`\`\`\n` +
          `\n**Available search criteria** - replace X with your query` +
          `\n- \`pack=X\`` +
          `\n- \`member=X\`` +
          `\n- \`stars=(<X/>X/X)\`` +
          `\n- \`serial=(<X/>X/X)\`` +
          `\n- \`price=(<X/>X/X)\`\n` +
          `\n**Usage**` +
          `\n\`${prefix}mp pack=diary member=heejin\` etc...`;
        break;
      }
      case "trade":
      case "trading": {
        header = "Trading";
        description =
          `**Trading** is a means to exchange cards between you and someone else.\n` +
          `\n__**How do I trade?**__` +
          `\nTo begin trading with someone, simply type \`${prefix}trade <@user>\`. The bot will then guide you through the following steps:` +
          `\n**1)** Enter up to five of **your cards** (type OK if you have less than 5 cards)` +
          `\n**2)** Whoever you're trading with enters up to five of **their cards** (again, type OK if there are less than 5 cards)` +
          `\n**3)** Both of you will confirm the trade.` +
          `\n**4)** Success${prefix}\n` +
          `\n__**Can I reverse a trade?**__` +
          `\nNo, you cannot reverse a trade; be careful who you're trading with${prefix}`;
        break;
      }

      // Commands
      case "prefix":
      case "settings": {
        header = "Prefix";
        description =
          `Server administrators change the **prefix** of Heekki by using \`${prefix}settings prefix <prefix here>\`\n` +
          `\n**Example**` +
          `\n\`${prefix}settings prefix !!\`` +
          `\n\`${prefix}settings prefix ?\``;
        break;
      }
      case "auc":
      case "bid":
      case "auction": {
        header = "Auctions";
        description =
          `**Auctions** are held from time to time in the official Heekki server. It's not just cards that can be auctioned, so keep an eye out${prefix}` +
          `\nBids must be at least ${this.config.discord.emoji.cash.full} **100** greater than the previous bid.\n` +
          `\n**Subcommands**` +
          `\n\`\`\`` +
          `\n${prefix}auction - shows active auction and top bid` +
          `\n${prefix}bid <amount> - bids on the active auction` +
          `\n\`\`\``;
        break;
      }
      case "j":
      case "jumble": {
        header = "Command - Jumble";
        description =
          `**Jumble** is a game where the objective is to unscramble a given LOONA-related term.` +
          `\nYou're given 15 seconds to crack the code - if you get it right, you get ${this.config.discord.emoji.cash.full} **20**${prefix}`;
        break;
      }
      case "memory": {
        header = "Command - Memory";
        description =
          `**Memory** is a game where the objective is to remember a sequence and identify at which number in the sequence a given member of LOONA is.` +
          `\nYou have only one attempt and 60 seconds - if you get it right, you get ${this.config.discord.emoji.cash.full} **40**${prefix}`;
        break;
      }
      case "prestige": {
        header = "Command - Prestige";
        description =
          `**Prestiging** your card will reset the card's heart count, but increase its stars by 1. You can only prestige cards that are at 5 stars or less.\n` +
          `\n__**How do I prestige?**__` +
          `\nWhen your card has hit level 99, simply use \`${prefix}prestige <card>\`.\n` +
          `\n**Related Commands**` +
          `\n\`\`\`` +
          `\n${prefix}upgrade <card> <amount> - adds hearts to a card` +
          `\n\`\`\``;
        break;
      }
      /*case "claimforfeit":
      case "cf": {
        header = "Command - Claim Forfeit";
        description =
          `You can **claim a forfeited card** once every 30 minutes.` +
          `\nYou can find forfeited cards by using \`${prefix}vff\`.`;
        break;
      }
      case "forfeit":
      case "ff": {
        header = "Command - Forfeit";
        description =
          `You can **forfeit** cards you no longer want by using \`${prefix}ff <card>\`.` +
          `\nThe card will then be available for anyone to claim, so be careful what you forfeit${prefix}\n` +
          `\n__**How do I stop a card from being forfeited?**__` +
          `\nYou can use \`${prefix}favorite <card>\` to mark it as Favorite. Favorited cards cannot be forfeited.`;
        break;
      }
      case "viewforfeited":
      case "vff": {
        header = "Command - View Forfeited Cards";
        description =
          `Using this command will show you a list of forfeited cards.\n` +
          `\n**Available search criteria** - replace X with your query` +
          `\n- \`pack=X\`` +
          `\n- \`member=X\`` +
          `\n- \`stars=(<X/>X/X)\`` +
          `\n- \`serial=(<X/>X/X)\``;
        break;
      }
      */
      case "top": {
        header = "Command - Top";
        description =
          `This command will show you top users sorted by a given category.\n` +
          `\n**Categories**` +
          `\n- \`${prefix}top cash\`` +
          `\n- \`${prefix}top hearts\`` +
          `\n- \`${prefix}top cards\``;
        break;
      }
      case "vp":
      case "viewpack":
      case "pack": {
        header = "Command - Pack";
        description = `This command will show you information about a pack including what cards are in it, the pack cover, flavor text, and the price of the pack (if it's for sale).`;
        break;
      }
      case "invite": {
        header = "Command - Invite";
        description = `This command will show you a link to invite the bot and a link to the official Heekki server.`;
        break;
      }
      case "pre":
      case "preview": {
        header = "Command - Preview";
        description =
          `This command will show up to nine cards and who owns them. It will not show card images.\n` +
          `\n**Usage**` +
          `\n\`${prefix}preview <cards...>\`\n` +
          `\n**Example**` +
          `\n\`${prefix}preview DLHJ#1 DLOH#3 LNJS#6\``;
        break;
      }
      case "stats": {
        header = "Command - Stats";
        description =
          `This command will show various statistics about the bot.` +
          `\nYou may also use \`${prefix}stats me\` to show statistics about yourself.`;
        break;
      }
      case "ticket": {
        header = "Command - Ticket";
        description = `This command opens a private ticket with the developer of Heekki. Please only use this for emergencies.`;
        break;
      }
      case "well": {
        header = "Command - Well";
        description =
          `The Well is a crowdsourced fund for various community-wide rewards - see \`${prefix}well\` for further information.\n` +
          `\n**Subcommands**` +
          `\n\`\`\`` +
          `\n${prefix}well top - shows top donators` +
          `\n${prefix}well give <amount> - throws money in the well` +
          `\n\`\`\``;
        break;
      }
      case "daily": {
        header = "Command - Daily";
        description = `Claims your daily reward - available once every 23 hours and 30 minutes.`;
        break;
      }
      case "description":
      case "desc": {
        header = "Command - Description";
        description =
          `Sets the description on your profile.\n` +
          `\n**Usage**` +
          `\n\`${prefix}desc put whatever you want here\``;
        break;
      }
      case "favorite":
      case "fav": {
        header = "Command - Favorite";
        description =
          `Marks a card as "Favorite", preventing it from being sold or traded. Also pushes the card to the top of your inventory.\n` +
          `\n**Usage**` +
          `\n\`${prefix}fav <card>\` ex. \`${prefix}fav DLHJ#1\``;
        break;
      }
      case "feed":
      case "upgrade": {
        header = "Command - Upgrade";
        description =
          `You can upgrade a card with hearts to increase its level. Your card will gain **one** level for every **150** hearts.` +
          `\nOnce your card hits level 99, you can use \`${prefix}prestige\` to increase the star count.\n` +
          `\n**Usage**` +
          `\n\`${prefix}upgrade <card> <amount>\` ex. \`${prefix}upgrade DLHJ#1 300\``;
        break;
      }
      case "send": {
        header = "Command - Send";
        description = `Sends one heart to each of your friends - usable once every hour.`;
        break;
      }
      case "gift": {
        header = "Command - Gift";
        description =
          `Gives a card to another user for free.\n` +
          `\n**Usage**` +
          `\n\`${prefix}gift <@user> <cards...>\` ex. \`${prefix}gift @RTFL#8058 DLHJ#1 DLHJ#2 DLHJ#3\``;
        break;
      }
      case "heartbox":
      case "hb": {
        header = "Command - Heart Box";
        description = `Opens some heart boxes, giving you a random amount of hearts. Usable **once every 4 hours**.`;
        break;
      }
      case "inventory":
      case "inv": {
        header = "Command - Inventory";
        description =
          `Shows a user's cards.` +
          `\n**Available search criteria** - replace X with your query` +
          `\n- \`pack=X\`` +
          `\n- \`member=X\`` +
          `\n- \`stars=(<X/>X/X)\`` +
          `\n- \`serial=(<X/>X/X)\`` +
          `\n- \`favorite=true/false\`` +
          `\n- \`forsale=true/false\``;
        break;
      }
      case "unrep":
      case "rep": {
        header = "Command - Reputation";
        description = `Gives or removes reputation from a user. See \`${prefix}help profile\` for further information.`;
        break;
      }
      case "t":
      case "timers": {
        header = "Command - Timers";
        description = `Shows you how long until you can execute your time-based rewards again.`;
        break;
      }
      case "tr":
      case "trivia": {
        header = "Command - Trivia";
        description = `**Trivia** is a game where you can answer questions - there's currently no reward, removed for balancing purposes.`;
        break;
      }
      case "using":
      case "use": {
        header = "Command - Use";
        description =
          `You can mark a card as "used" to automatically use it for missions.` +
          `\nWhen you're using a card, instead of typing \`${prefix}mission DLHJ#1\`, you can simply type \`${prefix}mission\`.\n` +
          `\n**Subcommands**` +
          `\n\`\`\`` +
          `\n${prefix}use <card> - marks a card for use` +
          `\n${prefix}using - shows what card you're using` +
          `\n\`\`\``;
        break;
      }
      case "view":
      case "show":
      case "card": {
        header = "Command - Card";
        description = `You can view your cards by using \`${prefix}card <card>\`. You **can not** view cards owned by other users.`;
        break;
      }
      case "bp":
      case "buypack": {
        header = "Command - Buy Pack";
        description = `Purchases a pack. Use \`${prefix}packs\` to see a list of packs.`;
        break;
      }
      case "packs": {
        header = "Command - Packs";
        description = `Shows a list of packs available for purchase.`;
        break;
      }
      case "p":
      case "profile": {
        header = "Command - Profile";
        description =
          `**Profiles** shows you information about players such as card count, reputation, badges, etc.\n` +
          `\n__**How do I set my description?**__` +
          `\nTo set your description, you can use \`${prefix}desc\`.\n` +
          `\n__**What is reputation?**__` +
          `\nReputation is given by other players - you should give reputation to users you think are trustworthy.\n` +
          `\n**Related Commands**` +
          `\n\`\`\`` +
          `\n${prefix}desc <description> - sets your description` +
          `\n${prefix}rep <@user> - gives someone reputation` +
          `\n${prefix}unrep <@user> - un-gives someone reputation` +
          `\n${prefix}inv - shows your inventory` +
          `\n\`\`\``;
        break;
      }
      default: {
        header = "Error";
        description =
          `\nSorry, I couldn't find that topic.` +
          `\nUse \`${prefix}help topics\` to see a list of topics.`;
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
    await msg.channel.send(embed);
  }
}
