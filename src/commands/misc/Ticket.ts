import { Message, MessageEmbed, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import moment from "moment";

export class Command extends BaseCommand {
  names: string[] = ["ticket"];
  async exec(msg: Message) {
    const description = this.options.join(" ");
    if (description.length < 30) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please describe your issue in at least 30 characters.`
      );
      return;
    }

    const ticketronChannel = <TextChannel>(
      msg.client.channels.cache.get("761790125243105320")
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
        `:white_check_mark: I've submitted your ticket for review by the developer.\n**Please do not submit another ticket about the same subject.**`
      )
      .setColor(`#FFAACC`);
    msg.channel.send(successEmbed);
  }
}
