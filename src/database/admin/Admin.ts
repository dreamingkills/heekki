import { Collection } from "../../entities/card/Collection";
import { SerialNumber } from "../../entities/card/SerialNumber";
import { Card } from "../../entities/card/Card";
import { CardImageData } from "../../entities/card/ImageData";
import { CollectionText } from "../../entities/card/text/CollectionText";
import { MemberText } from "../../entities/card/text/MemberText";
import { SerialText } from "../../entities/card/text/SerialText";
import { LevelText } from "../../entities/card/text/LevelText";
import { LevelNum } from "../../entities/card/text/LevelNum";
import { HeartText } from "../../entities/card/text/HeartText";

export class AdminService {
  public static async createNewCollection(
    values: string[]
  ): Promise<Collection> {
    let collectionText = await CollectionText.create({
      size: parseInt(values[2]),
      color: values[3],
      align: values[4] as "left" | "right" | "center",
      x: parseInt(values[5]),
      y: parseInt(values[6]),
    }).save();
    let memberText = await MemberText.create({
      size: parseInt(values[7]),
      color: values[8],
      align: values[9] as "left" | "right" | "center",
      x: parseInt(values[10]),
      y: parseInt(values[11]),
    }).save();
    let serialText = await SerialText.create({
      size: parseInt(values[12]),
      color: values[13],
      align: values[14] as "left" | "right" | "center",
      x: parseInt(values[15]),
      y: parseInt(values[16]),
    }).save();
    let levelText = await LevelText.create({
      size: parseInt(values[17]),
      color: values[18],
      align: values[19] as "left" | "right" | "center",
      x: parseInt(values[20]),
      y: parseInt(values[21]),
    }).save();
    let levelNum = await LevelNum.create({
      size: parseInt(values[22]),
      color: values[23],
      align: values[24] as "left" | "right" | "center",
      x: parseInt(values[25]),
      y: parseInt(values[26]),
    }).save();
    let heartText = await HeartText.create({
      size: parseInt(values[27]),
      color: values[28],
      align: values[29] as "left" | "right" | "center",
      x: parseInt(values[30]),
      y: parseInt(values[31]),
    }).save();
    let cardImageData = await CardImageData.create({
      fontName: values[1],
      starImageURL: values.slice(-6)[0],
      collectionText,
      memberText,
      serialText,
      levelText,
      levelNum,
      heartText,
      starStartingX: parseInt(values.slice(-6)[1]),
      starStartingY: parseInt(values.slice(-6)[2]),
      starSideLength: parseInt(values.slice(-6)[3]),
      starXIncrement: parseInt(values.slice(-6)[4]),
      starYIncrement: parseInt(values.slice(-6)[5]),
    }).save();
    let coll = await Collection.create({
      name: values[0],
      imageData: cardImageData,
    }).save();
    return coll;
  }

  public static async createNewCard(
    url: string,
    member: string,
    rarity: string,
    collectionId: string,
    credit: string
  ): Promise<Card> {
    let rarityInt = parseInt(rarity)!;
    let collection = await Collection.findOne({ where: { id: collectionId } })!;
    let sn = await SerialNumber.create().save();
    let card = await Card.create({
      imageUrl: url,
      member,
      rarity: rarityInt,
      collection: collection!,
      description: "No description set.",
      credit,
      serialNumber: sn,
    }).save();
    return new Card();
  }
}
