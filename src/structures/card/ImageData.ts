import { TextData } from "./TextData";

export class ImageData {
  heartImageUrl: string;
  heartX: number;
  heartY: number;
  heartLength: number;
  starImageUrl: string;
  starStartingX: number;
  starStartingY: number;
  starLength: number;
  starXInc: number;
  starYInc: number;

  packText: TextData;
  memberText: TextData;
  serialText: TextData;
  levelText: TextData;
  levelNum: TextData;
  heartText: TextData;

  constructor(
    imageData: {
      heart_image_url: string;
      heart_x: number;
      heart_y: number;
      heart_length: number;
      star_image_url: string;
      star_starting_x: number;
      star_starting_y: number;
      star_length: number;
      star_x_inc: number;
      star_y_inc: number;
    },
    packText: TextData,
    memberText: TextData,
    serialText: TextData,
    levelText: TextData,
    levelNum: TextData,
    heartText: TextData
  ) {
    this.heartImageUrl = imageData.heart_image_url;
    this.heartX = imageData.heart_x;
    this.heartY = imageData.heart_y;
    this.heartLength = imageData.heart_length;
    this.starImageUrl = imageData.star_image_url;
    this.starStartingX = imageData.star_starting_x;
    this.starStartingY = imageData.star_starting_y;
    this.starLength = imageData.star_length;
    this.starXInc = imageData.star_x_inc;
    this.starYInc = imageData.star_y_inc;

    this.packText = packText;
    this.memberText = memberText;
    this.serialText = serialText;
    this.levelText = levelText;
    this.levelNum = levelNum;
    this.heartText = heartText;
  }
}
