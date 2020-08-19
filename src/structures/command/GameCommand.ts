import { BaseCommand } from "./Command";

export abstract class GameCommand extends BaseCommand {
  public async heartsToLevel(hearts: number) {
    let unrounded = hearts / 50;
    let currentLevel = unrounded >= 1 ? Math.floor(unrounded) + 1 : 1;

    let nextRequirement = currentLevel * 50;
    let info = {
      totalHearts: hearts,
      level: currentLevel >= 99 ? 99 : currentLevel,
      next: currentLevel >= 99 ? -1 : nextRequirement,
      toNext: currentLevel >= 99 ? -1 : nextRequirement - hearts,
    };
    return info;
  }

  constructor() {
    super();
  }
}
