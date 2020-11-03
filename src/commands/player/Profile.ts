import { Message } from "discord.js";
import jimp from "jimp";
import canvas, { Image } from "canvas";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

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
        if (!member?.firstKey()) {
          await msg.channel.send(
            `<:red_x:741454361007357993> Sorry, but I couldn't find that user.`
          );
          return;
        }
        userQuery = await PlayerService.getProfileByDiscordId(
          member.firstKey()!
        );
      }
    } else userQuery = executor;

    const discordUser = await msg.client.users.fetch(userQuery.discord_id);
    if (!discordUser) {
      await msg.channel.send(
        `<:red_x:741454361007357993> Sorry, but I couldn't find that user.`
      );
      return;
    }
    const badges = await PlayerService.getBadgesByProfile(userQuery);
    const cardCount = await PlayerService.getCardCountByProfile(userQuery);

    /*const bg = await jimp.read(`./src/assets/profile_template.png`);
    const buffer = await bg.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(600, 600);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);
    const pfp = await canvas.loadImage(
      msg.author.displayAvatarURL({ format: "png" })
    );

    ctx.drawImage(background, 0, 0, 600, 600);

    //Draw username
    ctx.font = `45px theboldfont`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(discordUser.username, 195, 90);
    //Draw discriminator
    ctx.font = `65px theboldfont`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`#${discordUser.discriminator}`, 195, 150);
    // Draw profile picture
    ctx.save();
    ctx.beginPath();
    ctx.arc(100, 100, 75, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const avatar = await canvas.loadImage(
      discordUser.displayAvatarURL({ format: "png" })
    );
    ctx.drawImage(avatar, 25, 25, 150, 150);
    ctx.restore();

    // Draw card count
    ctx.font = `45px theboldfont`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`${cardCount.toLocaleString()} CARDS`, 95, 230);
    // Draw cash count
    ctx.font = `45px theboldfont`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`${userQuery.coins.toLocaleString()} CASH`, 95, 290);

    let buf = cv.toBuffer("image/png");
    let final = Buffer.alloc(buf.length, buf, "base64");

    await msg.channel.send(`> **${discordUser.tag}**'s Profile`, {
      files: [final],
    });*/

    const embed = new ProfileEmbed(
      userQuery,
      badges,
      discordUser,
      discordUser.displayAvatarURL(),
      userQuery.reputation,
      cardCount
    );
    await msg.channel.send(embed);
  }
}
