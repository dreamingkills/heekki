import { Message, MessageEmbed } from "discord.js";
import jimp from "jimp";
import canvas from "canvas";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["profile", "p"];

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: { tl: number; tr: number; bl: number; br: number },
    fill: boolean,
    stroke: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

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
    const cardCount = await PlayerService.getCardCountByProfile(userQuery);

    const bg = await jimp.read(`./src/assets/profile_blank.png`);
    const buffer = await bg.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(1100, 800);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, 1100, 800);

    //Draw username
    ctx.save();
    let baseSize = 75;
    do {
      ctx.font = `${(baseSize -= 10)}px MyriadPro-Bold`;
    } while (ctx.measureText(discordUser.username).width > cv.width - 340);
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(discordUser.username, 69, 178);
    // Draw profile picture
    this.roundRect(
      ctx,
      775,
      220,
      256,
      256,
      { tl: 25, bl: 25, br: 25, tr: 25 },
      false,
      false
    );
    ctx.clip();
    const avatar = await canvas.loadImage(
      discordUser.displayAvatarURL({ format: "png" })
    );
    ctx.drawImage(avatar, 775, 220, 256, 256);
    ctx.restore();

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
    // Draw shard count
    ctx.font = `65px MyriadPro-Bold`;
    ctx.fillStyle = "#FFAACC";
    ctx.textAlign = "left";
    ctx.fillText(userQuery.shards.toLocaleString(), 170, 460);

    // Draw badges
    if (userQuery.badges) {
      for (let badge of userQuery.badges) {
        const icon = await canvas.loadImage(
          `./src/assets/badges/${badge.emoji}`
        );
        ctx.drawImage(
          icon,
          70 + 128 * userQuery.badges.indexOf(badge),
          563,
          120,
          120
        );
      }
    }

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
