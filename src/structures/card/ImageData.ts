import { TextInterface } from "../interface/image/TextInterface";

export class ImageData {
  starImageUrl: string;
  starStartingX: number;
  starStartingY: number;
  starLength: number;
  starHeight: number;
  starXInc: number;
  starYInc: number;

  serialText: TextInterface;
  levelNum: TextInterface;
  heartText: TextInterface;

  constructor(
    imageData: {
      star_image_url: string;
      star_starting_x: number;
      star_starting_y: number;
      star_length: number;
      star_height: number;
      star_x_inc: number;
      star_y_inc: number;
    },
    serialText: TextInterface,
    levelNum: TextInterface,
    heartText: TextInterface
  ) {
    this.starImageUrl = imageData.star_image_url;
    this.starStartingX = imageData.star_starting_x;
    this.starStartingY = imageData.star_starting_y;
    this.starLength = imageData.star_length;
    this.starHeight = imageData.star_height;
    this.starXInc = imageData.star_x_inc;
    this.starYInc = imageData.star_y_inc;

    this.serialText = serialText;
    this.levelNum = levelNum;
    this.heartText = heartText;
  }
}
