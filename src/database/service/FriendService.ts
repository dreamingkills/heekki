import { PlayerService } from "./PlayerService";
import { FriendFetch } from "../sql/friend/FriendFetch";
import { Profile } from "../../structures/player/Profile";
import { FriendUpdate } from "../sql/friend/FriendUpdate";
import * as error from "../../structures/Error";

export class FriendService {
  public static async getProfilesFromRelationship(
    friendOneId: string,
    friendTwoId: string
  ): Promise<{ friendOne: Profile; friendTwo: Profile; friends: boolean }> {
    const friendOne = await PlayerService.getProfileByDiscordId(
      friendOneId,
      false
    );
    const friendTwo = await PlayerService.getProfileByDiscordId(
      friendTwoId,
      true
    );
    const relationshipExists = await FriendFetch.checkRelationshipExists(
      friendOne.discord_id,
      friendTwo.discord_id
    );

    return { friendOne, friendTwo, friends: relationshipExists };
  }

  public static async getFriendsByDiscordId(
    discord_id: string
  ): Promise<string[]> {
    let profile = await PlayerService.getProfileByDiscordId(discord_id, false);
    let friends = await FriendFetch.getFriendsByDiscordId(profile.discord_id);
    return friends;
  }

  public static async addFriendByDiscordId(
    sender_id: string,
    friend_id: string
  ): Promise<{ sender: Profile; friend: Profile }> {
    const relationship = await this.getProfilesFromRelationship(
      sender_id,
      friend_id
    );
    if (relationship.friendOne.discord_id == relationship.friendTwo.discord_id)
      throw new error.CannotAddYourselfError();
    if (relationship.friends) throw new error.DuplicateRelationshipError();

    await FriendUpdate.addFriendByDiscordId(
      relationship.friendOne.discord_id,
      relationship.friendTwo.discord_id
    );
    return { sender: relationship.friendOne, friend: relationship.friendTwo };
  }

  public static async removeFriendByDiscordId(
    sender_id: string,
    friend_id: string
  ): Promise<{ sender: Profile; friend: Profile }> {
    const relationship = await this.getProfilesFromRelationship(
      sender_id,
      friend_id
    );
    if (relationship.friendOne.discord_id == relationship.friendTwo.discord_id)
      throw new error.CannotRemoveYourselfError();
    if (!relationship.friends) throw new error.NonexistentRelationshipError();

    await FriendUpdate.removeFriendByDiscordId(
      relationship.friendOne.discord_id,
      relationship.friendTwo.discord_id
    );
    return { sender: relationship.friendOne, friend: relationship.friendTwo };
  }

  public static async sendHeartsToFriends(
    sender_id: string
  ): Promise<string[]> {
    const profile = await PlayerService.getProfileByDiscordId(sender_id, false);
    const friends = await this.getFriendsByDiscordId(profile.discord_id);
    const last = await PlayerService.getLastHeartSendByDiscordId(
      profile.discord_id
    );
    const until = last + 3600000;
    const now = Date.now();
    if (now < until) throw new error.SendHeartsCooldownError(until, now);

    await Promise.all([
      friends.forEach(async (f) => {
        await PlayerService.addHeartsToUserByDiscordId(f, 1);
      }),
    ]);
    await PlayerService.setLastHeartSendByDiscordId(profile.discord_id, now);

    return friends;
  }
}
