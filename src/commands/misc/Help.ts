import { Message, MessageEmbed } from "discord.js";
import version from "../../version.json";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["help", "docs"];
  description: string = "omo";
  async exec(msg: Message): Promise<void> {
    const query = this.options.join(" ").toLowerCase();
    const prefix = this.bot.getPrefix(msg.guild!.id);

    if (!query) {
      const embed = new MessageEmbed()
        .setAuthor(`Help | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `\nHeekki can be a complex bot, so we've created a help center to help reduce confusion and avoid having to go to external websites or servers.\n` +
            `\n**Popular Topics**` +
            `\n\`\`\`` +
            `oogz` +
            `\n\`\`\`` +
            `\nYou can use \`${prefix}help <command>\` for info about a command.` +
            `\nYou can use \`${prefix}help commands\` to see a command list.\n` +
            `\n:scientist: **Official Heekki Server**` +
            `\nhttps://discord.gg/KbcQjRG`
        )
        .setFooter(`Heekki v${version.version} — made with ❤️️ by RTFL#8058`)
        .setColor(`#FFAACC`);
      await msg.channel.send(embed);
      return;
    }

    const commandList = this.bot.cmdMan.commands;
    const command = commandList.filter((cmd) => {
      return cmd.names.indexOf(query) > -1;
    })[0];
    if (command) {
      let description = `${command.description}\n`;

      const aliases = command.names.slice(1).map((n) => `${prefix}${n}`);
      if (aliases.length > 0)
        description +=
          `\n**Aliases**` + `\n\`\`\`` + `\n${aliases.join(`, `)}` + `\n\`\`\``;

      if (command.users) {
        const whitelist: string[] = [];
        for (let whitelisted of command.users) {
          const user = await msg.client.users.fetch(whitelisted);
          whitelist.push(user.tag || "Unknown User");
        }
        description += `\n**Whitelisted Users**: ${whitelist.join(", ")}`;
      }

      const embed = new MessageEmbed()
        .setAuthor(
          `Help - ${prefix}${command.names[0]} | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        )
        .setColor(`#FFAACC`)
        .setDescription(description);
      await msg.channel.send(embed);
      return;
    }

    let header: string;
    let description: string;
    let footer = "";
    switch (query) {
      default: {
        header = "Error";
        description = "Sorry, but I couldn't find that subject.";
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
