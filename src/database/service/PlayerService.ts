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
    await PlayerUpdate.createNewProfile(discord_id);
    const user = await this.getProfileByDiscordId(discord_id);

    return user;
  }

  public static async getProfileByDiscordId(
    discord_id: string,
    autoGenerate: boolean = false
  ): Promise<Profile> {
    const user = await PlayerFetch.getProfileFromDiscordId(
      discord_id,
      autoGenerate
    );
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

  public static async addToWell(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.addToWell(profile.discord_id, amount);
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

  public static async setLastMission(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setMissionTimestamp(profile.discord_id, time);
  }

  public static async setLastDaily(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setDailyTimestamp(profile.discord_id, time);
  }

  public static async setLastHeartBox(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setHeartBoxTimestamp(profile.discord_id, time);
  }

  public static async setLastOrphanClaim(
    profile: Profile,
    time: number
  ): Promise<void> {
    await PlayerUpdate.setOrphanTimestamp(profile.discord_id, time);
  }

  public static async getFishByProfile(
    profile: Profile,
    trophy: boolean = false
  ): Promise<Fish[]> {
    return await PlayerFetch.getFishByDiscordId(profile.discord_id, trophy);
  }
  public static async createFishByDiscordId(
    profile: Profile,
    fishId: number,
    weight: number,
    weightModId: number,
    identifier: string
  ): Promise<void> {
    return await PlayerUpdate.createFish(
      profile.discord_id,
      fishId,
      weight,
      weightModId,
      identifier
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
  ): Promise<{ profile: Profile }[]> {
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

  /*
      Fishing
               */
  public static async getRandomFish(): Promise<{
    id: number;
    fish_name: string;
    fish_weight: number;
    emoji: string;
  }> {
    return await PlayerFetch.getRandomFish();
  }

  public static async getFishByUniqueId(id: string): Promise<Fish> {
    return await PlayerFetch.getFishByUniqueId(id);
  }
  public static async getRandomWeightMod(): Promise<{
    id: number;
    mod_name: string;
    multiplier: number;
  }> {
    return await PlayerFetch.getRandomWeightMod();
  }

  public static async getNumberOfFishByprofile(
    profile: Profile
  ): Promise<number> {
    return await PlayerFetch.getNumberOfFishByProfile(profile.discord_id);
  }

  public static async makeFishTrophy(id: string): Promise<void> {
    return await PlayerUpdate.makeFishTrophy(id);
  }

  public static async clearFish(owner: Profile): Promise<void> {
    return await PlayerUpdate.clearFish(owner.discord_id);
  }

  public static async toggleRestriction(profile: Profile): Promise<void> {
    if (profile.restricted) {
      await PlayerUpdate.unrestrictUser(profile.discord_id);
    } else {
      await PlayerUpdate.restrictUser(profile.discord_id);
    }
  }

  public static async getSupporters(): Promise<{ name: string; id: string }[]> {
    return await PlayerFetch.fetchSupporters();
  }
}
