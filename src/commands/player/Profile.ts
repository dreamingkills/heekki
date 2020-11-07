import { Message, MessageEmbed } from "discord.js";
import jimp from "jimp";
import canvas from "canvas";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["profile", "p"];
  async exec(msg: Message, executor: Profile) {
    let userQuery: Profile;
    if (this.options[0]) {
      if (msg.mentions.users.first()) {
        userQuery = await PlayerService.getProfileByDiscordId(
          msg.mentions.users.first()!.id
        );
      } else {
        const member = await msg.guild?.members.fetch({
          query: this.options.join(" "),
        });
        if (!member?.firstKey()) throw new error.InvalidMemberError();
        userQuery = await PlayerService.getProfileByDiscordId(
          member.firstKey()!
        );
      }
    } else userQuery = executor;

    const discordUser = await msg.client.users.fetch(userQuery.discord_id);
    if (!discordUser) throw new error.InvalidMemberError();
    const badges = await PlayerService.getBadgesByProfile(userQuery);
    const cardCount = await PlayerService.getCardCountByProfile(userQuery);

    const bg = await jimp.read(`./src/assets/profile_blank.png`);
    const buffer = await bg.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(1100, 800);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, 1100, 800);

    //Draw username
    ctx.font = `75px MyriadPro-Bold`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(discordUser.username, 69, 182);
    // Draw profile picture
    const avatar = await canvas.loadImage(
      discordUser.displayAvatarURL({ format: "png" })
    );
    ctx.drawImage(avatar, 775, 220, 256, 256);

    // Draw card count
    ctx.font = `25px MyriadPro-Bold`;
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(cardCount.toLocaleString(), 987, 144);
    // Draw cash count
    ctx.font = `65px MyriadPro-Bold`;
    ctx.fillStyle = "#FFAACC";
    ctx.textAlign = "left";
    ctx.fillText(userQuery.coins.toLocaleString(), 170, 273);
    // Draw heart count
    ctx.font = `65px MyriadPro-Bold`;
    ctx.fillStyle = "#FFAACC";
    ctx.textAlign = "left";
    ctx.fillText(userQuery.hearts.toLocaleString(), 170, 365);
    // Draw reputation count
    ctx.font = `65px MyriadPro-Bold`;
    ctx.fillStyle = "#FFAACC";
    ctx.textAlign = "left";
    ctx.fillText(userQuery.reputation.toLocaleString(), 170, 460);

    let buf = cv.toBuffer("image/png");
    let final = Buffer.alloc(buf.length, buf, "base64");

    const embed = new MessageEmbed()
      .setAuthor(`Profile | ${discordUser.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        userQuery.blurb ||
          "No description set!\nUse `!desc` to set your description."
      )
      .setColor(`#FFAACC`)
      .setFooter(`Took ${Date.now() - msg.createdTimestamp}ms`)
      .setTimestamp(Date.now());
    await msg.channel.send({
      files: [final],
      embed,
    });
  }
}
