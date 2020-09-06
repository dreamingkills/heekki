import * as error from "../../structures/Error";
import { PlayerFetch } from "../sql/player/PlayerFetch";
import { Profile } from "../../structures/player/Profile";
import { PlayerUpdate } from "../sql/player/PlayerUpdate";
import { UserCard } from "../../structures/player/UserCard";
import Chance from "chance";
import { CardService } from "./CardService";
import { Badge } from "../../structures/player/Badge";
import { UserCardService } from "./UserCardService";
import missions from "../../assets/missions.json";
import { MarketService } from "./MarketService";

export class PlayerService {
  public static async createNewUser(discord_id: string): Promise<Profile> {
    if (await PlayerFetch.checkIfUserExists(discord_id)) {
      throw new error.DuplicateProfileError();
    }

    await PlayerUpdate.createNewProfile(discord_id);
    const user = await this.getProfileByDiscordId(discord_id, false);

    return user;
  }

  public static async getProfileByDiscordId(
    discord_id: string,
    perspective: boolean
  ): Promise<Profile> {
    const user = await PlayerFetch.getProfileFromDiscordId(discord_id);

    if (!user) {
      if (perspective) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }

    return user;
  }

  public static async changeProfileDescription(
    discord_id: string,
    blurb: string
  ): Promise<{ old: string; new: string }> {
    const user = await this.getProfileByDiscordId(discord_id, false);

    await PlayerUpdate.changeDescription(discord_id, blurb);
    return { old: user.blurb, new: blurb };
  }

  public static async getBadgesByDiscordId(
    discord_id: string
  ): Promise<Badge[]> {
    return await PlayerFetch.getBadgesByDiscordId(discord_id);
  }

  public static async getCardsByUser(
    discord_id: string,
    options?: { starsLessThan?: number; limit?: number; page?: number }
  ): Promise<UserCard[]> {
    const user = await this.getProfileByDiscordId(discord_id, false);
    const cardList = await PlayerFetch.getUserCardsByDiscordId(
      user.discord_id,
      options
    );

    return cardList;
  }

  public static async openHeartBoxes(
    discord_id: string
  ): Promise<{ added: number; total: number; individual: number[] }> {
    const user = await this.getProfileByDiscordId(discord_id, false);

    const last = await PlayerFetch.getLastHeartBoxByDiscordId(user.discord_id);
    const now = Date.now();
    if (now < last + 14400000)
      throw new error.HeartBoxCooldownError(last + 14400000, now);

    const chance = new Chance();
    let generated: number[] = [];
    for (let i = 0; i < 7; i++) {
      generated.push(chance.weighted([7, 20, 100, 1000], [100, 25, 5, 0.1]));
    }

    const total = generated.reduce((a, b) => {
      return a + b;
    });
    await PlayerUpdate.addHearts(user.discord_id, total);
    await PlayerUpdate.setHeartBoxTimestamp(user.discord_id, now);
    return { added: total, total: user.hearts + total, individual: generated };
  }

  public static async giftCard(
    donator: string,
    recipient: string,
    reference: { abbreviation: string; serial: number }
  ): Promise<UserCard> {
    const gifter = await this.getProfileByDiscordId(donator, false);
    const receiver = await this.getProfileByDiscordId(recipient, true);

    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;
    if (gifter.discord_id != card.ownerId) throw new error.NotYourCardError();
    if (card.isFavorite) throw new error.FavoriteCardError();

    const transfer = await PlayerUpdate.transferCard(
      receiver.discord_id,
      card.userCardId
    );
    return transfer;
  }

  public static async getOrphanedCards(page: number): Promise<UserCard[]> {
    let cardList = await PlayerFetch.getUserCardsByDiscordId("0", {
      page: page,
      limit: 9,
    });
    return cardList;
  }

  public static async claimOrphanedCard(
    user: string,
    reference: { abbreviation: string; serial: number }
  ): Promise<UserCard> {
    let claimant = await this.getProfileByDiscordId(user, false);
    let last = await PlayerFetch.getLastOrphanClaimByDiscordId(
      claimant.discord_id
    );

    let now = Date.now();
    if (now < last + 10800000)
      throw new error.OrphanCooldownError(last + 10800000, now);
    let card = (await CardService.getCardDataFromReference(reference)).userCard;

    if (card.ownerId != "0") throw new error.CardNotOrphanedError();
    await PlayerUpdate.transferCard(claimant.discord_id, card.userCardId);
    await PlayerUpdate.setOrphanTimestamp(claimant.discord_id, now);
    return card;
  }

  public static async doMission(
    user: string,
    reference: { abbreviation: string; serial: number }
  ): Promise<{
    result: string;
    profit: number;
    lucky: boolean;
    card: UserCard;
  }> {
    const missionDoer = await this.getProfileByDiscordId(user, false);
    const last = await this.getLastMissionByDiscordId(user);

    let now = Date.now();
    if (now < last + 1800000)
      throw new error.MissionCooldownError(last + 1800000, now);
    let card = (await CardService.getCardDataFromReference(reference)).userCard;

    if (card.ownerId != user) throw new error.NotYourCardError();

    const chance = new Chance();
    const roll = chance.integer({ min: 1, max: 2500 });
    if (roll === 1738 && card.stars < 6) {
      await UserCardService.incrementCardStars(card.userCardId);
    }

    const profit = chance.integer({ min: 50, max: 350 });
    await PlayerService.addCoinsToUserByDiscordId(
      missionDoer.discord_id,
      profit
    );
    await PlayerService.setLastMissionByDiscordId(missionDoer.discord_id, now);

    const result = chance.pickone(missions.missions);
    return {
      result,
      profit,
      lucky: roll === 1738 && card.stars < 6 ? true : false,
      card: card,
    };
  }

  public static async claimDaily(
    discord_id: string
  ): Promise<{ added: number; total: number; user: Profile }> {
    const dailyClaimer = await this.getProfileByDiscordId(discord_id, false);
    const last = await this.getLastDailyByDiscordId(dailyClaimer.discord_id);

    let now = Date.now();
    if (now < last + 86400000)
      throw new error.DailyCooldownError(last + 86400000, now);

    Promise.all([
      await this.addCoinsToUserByDiscordId(dailyClaimer.discord_id, 750),
      await this.setLastDailyByDiscordId(dailyClaimer.discord_id, now),
    ]);
    return { added: 750, total: dailyClaimer.coins + 750, user: dailyClaimer };
  }

  public static async setLastHeartSendByDiscordId(
    discord_id: string,
    time: number
  ): Promise<number> {
    await PlayerUpdate.setHeartSendTimestamp(discord_id, time);
    return time;
  }

  public static async getLastHeartSendByDiscordId(
    discord_id: string
  ): Promise<number> {
    return await PlayerFetch.getLastHeartSendByDiscordId(discord_id);
  }

  public static async setLastMissionByDiscordId(
    discord_id: string,
    time: number
  ): Promise<number> {
    await PlayerUpdate.setMissionTimestamp(discord_id, time);
    return time;
  }

  public static async getLastMissionByDiscordId(
    discord_id: string
  ): Promise<number> {
    return await PlayerFetch.getLastMissionByDiscordId(discord_id);
  }

  public static async addHeartsToUserByDiscordId(
    discord_id: string,
    amount: number
  ): Promise<number> {
    await PlayerUpdate.addHearts(discord_id, amount);
    return amount;
  }

  public static async setLastDailyByDiscordId(
    discord_id: string,
    time: number
  ): Promise<number> {
    await PlayerUpdate.setDailyTimestamp(discord_id, time);
    return time;
  }

  public static async getLastDailyByDiscordId(
    discord_id: string
  ): Promise<number> {
    return await PlayerFetch.getLastDailyByDiscordId(discord_id);
  }

  public static async removeHeartsFromUserByDiscordId(
    discord_id: string,
    amount: number
  ): Promise<number> {
    await PlayerUpdate.removeHearts(discord_id, amount);
    return amount;
  }

  public static async addCoinsToUserByDiscordId(
    discord_id: string,
    amount: number
  ): Promise<number> {
    await PlayerUpdate.addCoins(discord_id, amount);
    return amount;
  }

  public static async removeCoinsFromUserByDiscordId(
    discord_id: string,
    amount: number
  ): Promise<number> {
    await PlayerUpdate.removeCoins(discord_id, amount);
    return amount;
  }

  public static async getCardCountByUserId(
    discord_id: string
  ): Promise<number> {
    return await PlayerFetch.getCardCountByDiscordId(discord_id);
  }

  public static async toggleFavorite(
    reference: {
      abbreviation: string;
      serial: number;
    },
    sender: string
  ): Promise<UserCard> {
    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;

    if (card.ownerId !== sender) throw new error.NotYourCardError();
    if ((await MarketService.cardIsOnMarketplace(card.userCardId)).forSale)
      throw new error.CardOnMarketplaceError();

    return await UserCardService.setCardFavorite(card.userCardId);
  }
}
