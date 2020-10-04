import {
  EmbedField,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
import { Chance } from "chance";
import * as error from "../../structures/Error";
import { TradeService } from "../../database/service/TradeService";

export class Command extends BaseCommand {
  names: string[] = ["market", "mp"];

  async exec(msg: Message, executor: Profile) {
    const subcommand = this.options[0];

    switch (subcommand) {
      case "send": {
        break;
      }
      case "accept": {
        break;
      }
      case "reject": {
        break;
      }
      case "cancel": {
        break;
      }
      default: {
      }
    }
  }
}
