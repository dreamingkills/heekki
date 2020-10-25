import { WellFetch } from "../sql/well/WellFetch";

export class WellService {
  public static async getWellTotal(): Promise<number> {
    return await WellFetch.getWellTotal();
  }
}
