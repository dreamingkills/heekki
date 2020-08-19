import { Pack as PackStruct } from "../../structures/shop/Pack";
import { Pack } from "../../entities/shop/Pack";
import * as error from "../../structures/Error";
import { Collection } from "../../entities/card/Collection";

export class ShopService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  public static async getPackByID(id: number) {
    let pack = Pack.findOne({ id });
  }

  public static async getAllPacks(page: number): Promise<PackStruct[]> {
    let pack = await Pack.getRepository()
      .createQueryBuilder("pack")
      .skip(page * 10 - 10)
      .take(10)
      .where("active=TRUE")
      .getMany();

    let packList = [];
    for (let p of pack) {
      console.log(p);
      let coll = await Collection.findOne({ id: p.collection_id });
      console.log(coll);
      packList.push(new PackStruct(p, coll!));
    }
    return packList;
  }
}
