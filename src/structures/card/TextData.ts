export class TextData {
  font: string;
  size: number;
  color: string;
  align: "left" | "center" | "right";
  x: number;
  y: number;

  constructor(data: {
    font: string;
    size: number;
    color: string;
    align: "left" | "center" | "right";
    x: number;
    y: number;
  }) {
    this.font = data.font;
    this.size = data.size;
    this.color = data.color;
    this.align = data.align;
    this.x = data.x;
    this.y = data.y;
  }
}
