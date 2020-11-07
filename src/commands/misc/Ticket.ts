import { Message, MessageEmbed, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import moment from "moment";

export class Command extends BaseCommand {
  names: string[] = ["ticket"];
  async exec(msg: Message) {
    const description = this.options.join(" ");
    if (description.length < 30) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please describe your issue in at least 30 characters.`
      );
      return;
    }

    const ticketronChannel = <TextChannel>(
      await msg.client.channels.fetch("761790125243105320")
    );
    const embed = new MessageEmbed()
      .setAuthor(`New Ticket | ${msg.author.tag} (${msg.author.id})`)
      .setDescription(description)
      .setColor(`#FFAACC`);

    const attachment = msg.attachments.first();
    if (attachment) {
      embed.setImage(attachment.url);
    }

    const now = moment(Date.now()).format(`MMMM Do YYYY [@] HH:mm:ss`);
    embed.setFooter(`Sent at ${now} - from ${msg.guild?.name}`);

    await ticketronChannel.send(embed);
    const successEmbed = new MessageEmbed()
      .setAuthor(`Ticket Submitted | ${msg.author.tag}`)
      .setDescription(
        `${this.config.discord.emoji.check.full} I've submitted your ticket for review by the developer.\n**Please do not submit another ticket about the same subject.**`
      )
      .setColor(`#FFAACC`);
    await msg.channel.send(successEmbed);
  }
}
