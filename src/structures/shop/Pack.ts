import { Pack as PackEntity } from "../../entities/shop/Pack";
import { Collection } from "../../entities/card/Collection";

export class Pack {
  pack_id: number;
  collection_id: number;
  name: string;
  price: number;
  active: boolean;

  constructor(pack: PackEntity, coll: Collection) {
    this.pack_id = pack.id;
    this.collection_id = coll.id;
    this.name = coll.name;
    this.price = pack.price;
    this.active = pack.active;
  }
}
