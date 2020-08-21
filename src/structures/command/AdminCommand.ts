import { BaseCommand } from "./Command";

export abstract class AdminCommand extends BaseCommand {
  public collectionKeys = [
    "name",
    "fontName",
    "collectionText.size",
    "collectionText.color",
    "collectionText.align",
    "collectionText.x",
    "collectionText.y",
    "memberText.size",
    "memberText.color",
    "memberText.align",
    "memberText.x",
    "memberText.y",
    "serialText.size",
    "serialText.color",
    "serialText.align",
    "serialText.x",
    "serialText,y",
    "levelText.size",
    "levelText.color",
    "levelText.align",
    "levelText.x",
    "levelText.y",
    "levelNum.size",
    "levelNum.color",
    "levelNum.align",
    "levelNum.x",
    "levelNum.y",
    "heartText.size",
    "heartText.color",
    "heartText.align",
    "heartText.x",
    "heartText.y",
    "starImageURL",
    "starStartingX",
    "starStartingY",
    "starSideLength",
    "starXIncrement",
    "starYIncrement",
  ];
  constructor() {
    super();
  }
}
