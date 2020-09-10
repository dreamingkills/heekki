import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["timers", "t"];
  usage: string[] = ["%c"];
  desc: string = "Shows the time until you can claim your time-based rewards.";
  category: string = "player";

  exec = async (msg: Message) => {
    const id = (await PlayerService.getProfileByDiscordId(msg.author.id, false))
      .discord_id;
    const now = moment(Date.now());
    const timeUntilDaily = moment(
      (await PlayerService.getLastDailyByDiscordId(id)) + 86400000
    );
    const timeUntilMission = moment(
      (await PlayerService.getLastMissionByDiscordId(id)) + 1800000
    );
    const timeUntilSend = moment(
      (await PlayerService.getLastHeartSendByDiscordId(id)) + 3600000
    );
    const timeUntilHeartBox = moment(
      (await PlayerService.getLastHeartBoxByDiscordId(id)) + 14400000
    );
    const timeUntilForfeitClaim = moment(
      (await PlayerService.getLastOrphanClaimByDiscordId(id)) + 10800000
    );

    const embed = new MessageEmbed()
      .setAuthor(`Timers | ${msg.author.tag}`)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor(`#40BD66`)
      .setDescription(
        `:alarm_clock: **Time-Based Rewards**\n- Daily Reward: ${
          now <= timeUntilDaily
            ? moment.utc(timeUntilDaily.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n-  Heart Boxes: ${
          now <= timeUntilHeartBox
            ? moment.utc(timeUntilHeartBox.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n-  Send Hearts: ${
          now <= timeUntilSend
            ? moment.utc(timeUntilSend.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n-  Mission: ${
          now <= timeUntilMission
            ? moment.utc(timeUntilMission.diff(now)).format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }\n- Claim Forfeited Card: ${
          now <= timeUntilForfeitClaim
            ? moment
                .utc(timeUntilForfeitClaim.diff(now))
                .format(`[__]HH:mm:ss[__]`)
            : "**Now!**"
        }`
      );

    msg.channel.send(embed);
  };
}
