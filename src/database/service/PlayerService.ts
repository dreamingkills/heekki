import { PlayerFetch } from "../sql/player/PlayerFetch";
import { Profile } from "../../structures/player/Profile";
import { PlayerUpdate } from "../sql/player/PlayerUpdate";
import { UserCard } from "../../structures/player/UserCard";
import { Badge } from "../../structures/player/Badge";

export class PlayerService {
  /*
      Time-Based Rewards
                          */
  public static async incrementDailyStreak(profile: Profile): Promise<Profile> {
    return await PlayerUpdate.incrementDailyStreak(profile);
  }
  public static async resetDailyStreak(profile: Profile): Promise<Profile> {
    return await PlayerUpdate.resetDailyStreak(profile);
  }

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
    options: { [key: string]: string | number } = {}
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
    options: { [key: string]: string | number } = {}
  ): Promise<number> {
    return await PlayerFetch.getCardCountByDiscordId(
      profile.discord_id,
      options
    );
  }

  public static async getForfeitedCardCount(
    options: { [key: string]: string | number } = {}
  ): Promise<number> {
    return await PlayerFetch.getCardCountByDiscordId("0", options);
  }

  public static async useCard(card: UserCard, profile: Profile): Promise<void> {
    return await PlayerUpdate.useCard(profile.discord_id, card.userCardId);
  }

  public static async unsetDefaultCard(profile: Profile): Promise<void> {
    return await PlayerUpdate.unsetDefaultCard(profile.discord_id);
  }

  public static async getOrphanedCards(
    options: {
      [key: string]: string | number;
    } = {}
  ): Promise<UserCard[]> {
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

  public static async removeHeartsFromProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.removeHearts(profile.discord_id, amount);
  }

  public static async addCoinsToProfile(
    profile: Profile,
    amount: number
  ): Promise<Profile> {
    return await PlayerUpdate.addCoins(profile.discord_id, amount);
  }
  public static async removeCoinsFromProfile(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.removeCoins(profile.discord_id, amount);
  }

  public static async addShardsToProfile(
    profile: Profile,
    amount: number
  ): Promise<Profile> {
    return await PlayerUpdate.addShards(profile, amount);
  }
  public static async removeShardsFromProfile(
    profile: Profile,
    amount: number
  ): Promise<Profile> {
    return await PlayerUpdate.removeShards(profile, amount);
  }

  public static async addToWell(
    profile: Profile,
    amount: number
  ): Promise<void> {
    await PlayerUpdate.addToWell(profile.discord_id, amount);
  }

  /* 
      Timers 
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
