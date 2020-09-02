import * as error from "../structures/Error";

export class AdminService {
  /*public static async setText(
    font: string,
    size: number,
    color: string,
    align: "left" | "right" | "center",
    x: number,
    y: number,
    type: string
  ) {
    let cls;
    switch (type) {
      case "CollectionText": {
        cls = CollectionText.create();
        break;
      }
      case "MemberText": {
        cls = MemberText.create();
        break;
      }
      case "SerialText": {
        cls = SerialText.create();
        break;
      }
      case "LevelText": {
        cls = LevelText.create();
        break;
      }
      case "LevelNum": {
        cls = LevelNum.create();
        break;
      }
      case "HeartText": {
        cls = HeartText.create();
        break;
      }
      default: {
        return;
      }
    }
    cls.font = font;
    cls.size = size;
    cls.color = color;
    cls.align = align;
    cls.x = x;
    cls.y = y;
    console.log(cls);
    return cls;
  }

  public static async createNewCollection(name: string): Promise<Collection> {
    let collectionText = await CollectionText.create().save();
    let memberText = await MemberText.create().save();
    let serialText = await SerialText.create().save();
    let levelText = await LevelText.create().save();
    let levelNum = await LevelNum.create().save();
    let heartText = await HeartText.create().save();
    let cardImageData = await ImageData.create({
      collectionText,
      memberText,
      serialText,
      levelText,
      levelNum,
      heartText,
    }).save();
    let coll = await Collection.create({
      name: name,
      imageData: cardImageData,
    }).save();
    return coll;
  }

  public static async createNewCard(
    url: string,
    member: string,
    rarity: string,
    collectionId: string,
    credit: string,
    abbr: string
  ): Promise<Card> {
    let rarityInt = parseInt(rarity)!;
    let collection = await Collection.findOne({ where: { id: collectionId } })!;
    console.log(collection);
    if (!collection) throw new error.InvalidCollectionError();
    let sn = await SerialNumber.create().save();
    let card = await Card.create({
      imageUrl: url,
      member,
      rarity: rarityInt,
      collection: collection,
      description: "No description set.",
      credit,
      serialNumber: sn,
      abbreviation: abbr,
    }).save();
    return card;
  }

  public static async fetchCollectionByID(
    id: number
  ): Promise<Collection | undefined> {
    let coll = await Collection.find({
      where: { id },
      relations: ["imageData"],
    });
    return coll[0];
  }*/
}
