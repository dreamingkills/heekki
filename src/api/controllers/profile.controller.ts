// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import { get, param } from "@loopback/rest";
import { PlayerService } from "../../database/service/PlayerService";
import { Profile } from "../../structures/player/Profile";
import { APIError } from "../../structures/APIError";
import { UserCard } from "../../structures/player/UserCard";

export class ProfileController {
  constructor() {}
  @get("/profile/{id}")
  async getProfile(
    @param.path.string("id") id: string
  ): Promise<{ profile: Profile } | { errors: APIError[] }> {
    try {
      const profile = await PlayerService.getProfileByDiscordId(id);
      return { profile };
    } catch (e) {
      console.log(e);
      return {
        errors: [new APIError(1, "That user does not have a profile.")],
      };
    }
  }

  @get("/profile/{id}/inventory")
  async getInventory(
    @param.path.string("id") id: string,
    @param.query.number("count") count: number,
    @param.query.number("page") page: number,
    @param.query.string("pack") pack: string,
    @param.query.string("member") member: string,
    @param.query.number("serial") serial: number,
    @param.query.number("stars") stars: number,
    @param.query.boolean("forsale") forsale: boolean
  ): Promise<{ inventory: UserCard[] } | { errors: APIError[] }> {
    try {
      const profile = await PlayerService.getProfileByDiscordId(id);
      const inventory = await PlayerService.getCardsByProfile(profile, {
        limit: count,
        page,
        pack,
        member,
        serial,
        stars,
        forsale: forsale?.toString(),
      });
      return { inventory: inventory };
    } catch (e) {
      console.log(e.name + " " + e.message);
      if (e.name === "NoProfileError")
        return {
          errors: [new APIError(1, "That user does not have a profile.")],
        };
      return { errors: [new APIError(0, e.message)] };
    }
  }

  @get("/profile/{id}/timers")
  async getTimers(
    @param.path.string("id") id: string
  ): Promise<{ timers: { [key: string]: number }[] } | { errors: APIError[] }> {
    console.log(id);
    try {
      const profile = await PlayerService.getProfileByDiscordId(id);

      const timerDaily = await PlayerService.getLastDaily(profile);
      const timerHeartBox = await PlayerService.getLastHeartBox(profile);
      const timerSend = await PlayerService.getLastHeartSend(profile);
      const timerMission = await PlayerService.getLastMission(profile);
      const timerOrphan = await PlayerService.getLastOrphanClaim(profile);
      return {
        timers: [
          { daily: timerDaily },
          { heart_box: timerHeartBox },
          { send_hearts: timerSend },
          { mission: timerMission },
          { claim_forfeit: timerOrphan },
        ],
      };
    } catch (e) {
      console.log(e.name + " " + e.message);
      if (e.name === "NoProfileError")
        return {
          errors: [new APIError(1, "That user does not have a profile.")],
        };
      return { errors: [new APIError(0, e.message)] };
    }
  }
}
