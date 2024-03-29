import { Message, MessageEmbed } from "discord.js";
import moment from "moment";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["timers", "t"];
  async exec(msg: Message, executor: Profile) {
    const prefix = this.bot.getPrefix(msg.guild!.id);
    const now = moment(Date.now());
    const timeUntilDaily = moment(executor.lastDaily + (86400000 - 1800000));
    const timeUntilMission = moment(executor.missionNext);
    const timeUntilSend = moment(executor.lastHeartSend + 3600000);
    const timeUntilHeartBox = moment(executor.lastHeartBox + 14400000);
    //const timeUntilForfeitClaim = moment(executor.lastOrphan + 1800000);

    const embed = new MessageEmbed()
      .setAuthor(`Timers | ${msg.author.tag}`)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor(`#FFAACC`)
      .setDescription(
        `:alarm_clock: **Time-Based Rewards**\n- \`${prefix}daily\` Daily Reward: ${
          now <= timeUntilDaily
            ? moment.utc(timeUntilDaily.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n- \`${prefix}hb\` Heart Boxes: ${
          now <= timeUntilHeartBox
            ? moment.utc(timeUntilHeartBox.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n- \`${prefix}send\` Send Hearts: ${
          now <= timeUntilSend
            ? moment.utc(timeUntilSend.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n- \`${prefix}mission\` Mission: ${
          now <= timeUntilMission
            ? moment.utc(timeUntilMission.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }`
      );

    await msg.channel.send(embed);
  }
}
