import { BaseCommand } from "./Command";
import { User } from "../../entities/User";
import { Message } from "discord.js";

export abstract class GameCommand extends BaseCommand {
  entities = {
    user: User,
  };

  constructor() {
    super();
  }
}
