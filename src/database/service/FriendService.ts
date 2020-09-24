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
    const friendOne = await PlayerService.getProfileByDiscordId(friendOneId);
    const friendTwo = await PlayerService.getProfileByDiscordId(friendTwoId);
    const relationshipExists = await FriendFetch.checkRelationshipExists(
      friendOne.discord_id,
      friendTwo.discord_id
    );

    return { friendOne, friendTwo, friends: relationshipExists };
  }

  public static async getFriendsByProfile(profile: Profile): Promise<string[]> {
    let friends = await FriendFetch.getFriendIdsByDiscordId(profile.discord_id);
    return friends;
  }

  public static async addFriendByDiscordId(
    sender: Profile,
    friend: Profile
  ): Promise<{ sender: Profile; friend: Profile }> {
    const relationship = await this.getProfilesFromRelationship(
      sender.discord_id,
      friend.discord_id
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
    sender: Profile,
    friend: Profile
  ): Promise<{ sender: Profile; friend: Profile }> {
    const relationship = await this.getProfilesFromRelationship(
      sender.discord_id,
      friend.discord_id
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

  public static async sendHeartsToFriends(profile: Profile): Promise<string[]> {
    const friends = await this.getFriendsByProfile(profile);
    const last = await PlayerService.getLastHeartSend(profile);
    const until = last + 3600000;
    const now = Date.now();
    if (now < until) throw new error.SendHeartsCooldownError(until, now);

    await Promise.all([
      friends.forEach(async (f) => {
        await PlayerService.addHeartsToDiscordId(f, 1);
      }),
    ]);
    await PlayerService.setLastHeartSend(profile, now);

    return friends;
  }
}
