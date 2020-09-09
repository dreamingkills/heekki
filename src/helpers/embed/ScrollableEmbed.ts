import { MessageEmbed } from "discord.js";

export class ScrollableEmbed extends MessageEmbed {
  page: number;

  public async switchPage(
    type: "prev" | "next",
    data: {
      author?: string;
      thumbnail?: string;
      desc?: string;
      footer?: string;
      color?: string;
    }
  ): Promise<MessageEmbed> {
    type === "prev" ? (this.page -= 1) : (this.page += 1);
    if (data.author) this.setAuthor(data.author);
    if (data.thumbnail) this.setThumbnail(data.thumbnail);
    if (data.desc) this.setDescription(data.desc);
    if (data.footer) this.setFooter(data.footer);
    if (data.color) this.setColor(data.color);

    return this;
  }

  constructor(page: number) {
    super();
    this.page = page;
  }
}
