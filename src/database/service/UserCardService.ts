import { CardFetch } from "../sql/card/CardFetch";
import { UserCard } from "../../structures/player/UserCard";
import { ImageData } from "../../structures/card/ImageData";

export class UserCardService {
  public static async getCardByUserCardId(
    id: number
  ): Promise<{ card: UserCard; imageData: ImageData }> {
    let fullCard = await CardFetch.getCardByUserCardId(id);
    return fullCard;
  }
}
