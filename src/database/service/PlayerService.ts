import * as error from "../../structures/Error";
import { PlayerFetch } from "../sql/player/PlayerFetch";
import { Profile } from "../../structures/player/Profile";
import { PlayerUpdate } from "../sql/player/PlayerUpdate";
import { UserCard } from "../../structures/player/UserCard";
import Chance from "chance";
import { Badge } from "../../structures/player/Badge";
import { Fish } from "../../structures/game/Fish";

export class PlayerService {
  public static async createNewProfile(discord_id: string): Promise<Profile> {
    if (await PlayerFetch.checkIfUserExists(discord_id)) {
      throw new error.DuplicateProfileError();
    }

    await PlayerUpdate.createNewProfile(discord_id);
    const user = await this.getProfileByDiscordId(discord_id);

    return user;
  }

  public static async getProfileByDiscordId(
    discord_id: string
  ): Promise<Profile> {
    const user = await PlayerFetch.getProfileFromDiscordId(discord_id);
    return user;
  }

  public static async changeProfileDescriptionByDiscordId(
    profile: Profile,
    blurb: string
  ): Promise<{ old: string; new: string }> {
    const user = await this.getProfileByDiscordId(profile.discord_id);

    await PlayerUpdate.changeDescription(profile.discord_id, blurb);
    return { old: user.blurb, new: blurb };
  }

  /*
      Badges
              */
  public static async getBadgesByProfile(profile: Profile): Promise<Badge[]> {
    return await PlayerFetch.getBadgesByDiscordId(profile.discord_id);
  }

  public static async getBadgeByBadgeId(badge_id: number): Promise<Badge> {
    return await PlayerFetch.getBadgeByBadgeId(badge_id);
  }

  public static async giveBadgeToUser(
    profile: Profile,
    badge: Badge
  ): Promise<void> {
    await PlayerUpdate.giveBadge(profile.discord_id, badge.id);
  }
  public static async getCardsByProfile(
    profile: Profile,
    options?: { [key: string]: string | number }
  ): Promise<UserCard[]> {
    const user = await this.getProfileByDiscordId(profile.discord_id);
    const cardList = await PlayerFetch.getUserCardsByDiscordId(
      user.discord_id,
      options
    );

    return cardList;
  }

  public static async getCardCountByProfile(
    profile: Profile,
    options?: { [key: string]: string | number }
  ): Promise<number> {
    return await PlayerFetch.getCardCountByDiscordId(
      profile.discord_id,
      options
    );
  }

  public static async openHeartBoxes(
    profile: Profile
  ): Promise<{ added: number; total: number; individual: number[] }> {
    const last = await this.getLastHeartBox(profile);

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
    await Promise.all([
      this.addHeartsToProfile(profile, total),
      this.setLastHeartBox(profile, now),
    ]);
    return {
      added: total,
      total: profile.hearts + total,
      individual: generated,
    };
  }

  public static async getOrphanedCardCount(options?: {
    [key: string]: string | number;
  }): Promise<number> {
    return await PlayerFetch.getOrphanedCardCount(options);
  }
  public static async getOrphanedCards(options?: {
    [key: string]: string | number;
  }): Promise<UserCard[]> {
    let cardList = await PlayerFetch.getUserCardsByDiscordId("0", options);
    return cardList;
  }

  /* 
      Currency Manipulation 
                              */

  public static async addHeartsToProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.addHearts(profile.discord_id, amount);
  }
  public static async addHeartsToDiscordId(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.addHearts(discord_id, amount);
  }

  public static async removeHeartsFromProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.removeHearts(profile.discord_id, amount);
  }

  public static async addCoinsToProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.addCoins(profile.discord_id, amount);
  }

  public static async removeCoinsFromProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.removeCoins(profile.discord_id, amount);
  }

  /* 
      Timers Get & Set 
                        */

  public static async setLastHeartSend(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setHeartSendTimestamp(profile.discord_id, time);
  }

  public static async getLastHeartSend(profile: Profile): Promise<number> {
    return await PlayerFetch.getLastHeartSendByDiscordId(profile.discord_id);
  }

  public static async setLastMission(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setMissionTimestamp(profile.discord_id, time);
  }

  public static async getLastMission(profile: Profile): Promise<number> {
    return await PlayerFetch.getLastMissionByDiscordId(profile.discord_id);
  }

  public static async setLastDaily(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setDailyTimestamp(profile.discord_id, time);
  }

  public static async getLastDaily(profile: Profile): Promise<number> {
    return await PlayerFetch.getLastDailyByDiscordId(profile.discord_id);
  }

  public static async setLastHeartBox(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setHeartBoxTimestamp(profile.discord_id, time);
  }

  public static async getLastHeartBox(profile: Profile): Promise<number> {
    return await PlayerFetch.getLastHeartBoxByDiscordId(profile.discord_id);
  }

  public static async setLastOrphanClaim(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setOrphanTimestamp(profile.discord_id, time);
  }

  public static async getLastOrphanClaim(profile: Profile): Promise<number> {
    return await PlayerFetch.getLastOrphanClaimByDiscordId(profile.discord_id);
  }

  public static async getFishByProfile(profile: Profile): Promise<Fish[]> {
    return await PlayerFetch.getFishByDiscordId(profile.discord_id);
  }
  public static async createFishByDiscordId(
    profile: Profile,
    fish: string,
    weight: number,
    gender: "male" | "female" | "???"
  ): Promise<void> {
    return await PlayerUpdate.createFish(
      profile.discord_id,
      fish,
      weight,
      gender
    );
  }

  public static async giveReputation(
    sender: Profile,
    receiver: Profile
  ): Promise<void> {
    await PlayerUpdate.giveReputation(sender.discord_id, receiver.discord_id);
  }

  public static async removeReputation(
    sender: Profile,
    receiver: Profile
  ): Promise<void> {
    await PlayerUpdate.removeReputation(sender.discord_id, receiver.discord_id);
  }

  public static async checkReputation(
    sender: Profile,
    receiver: Profile
  ): Promise<boolean> {
    return await PlayerFetch.checkReputation(
      sender.discord_id,
      receiver.discord_id
    );
  }

  public static async getReputationByProfile(
    profile: Profile
  ): Promise<number> {
    return await PlayerFetch.getReputation(profile.discord_id);
  }

  public static async getRichestUsers(limit: number = 15): Promise<Profile[]> {
    return await PlayerFetch.getRichestUsers(limit);
  }

  public static async getTopCollectors(
    limit: number = 15
  ): Promise<{ profile: Profile; count: number }[]> {
    return await PlayerFetch.getTopCollectors(limit);
  }

  public static async getTopHearts(limit: number = 15): Promise<Profile[]> {
    return await PlayerFetch.getMostHearts(limit);
  }

  public static async getTopXp(limit: number = 15): Promise<Profile[]> {
    return await PlayerFetch.getTopXp(limit);
  }

  public static async addXp(profile: Profile, amount: number): Promise<void> {
    return await PlayerUpdate.addXp(profile.discord_id, amount);
  }
}
