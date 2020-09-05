import moment from "moment";

export abstract class ClientError extends Error {
  message: string;
  name = "ClientError";
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }
}
export class NoProfileError extends ClientError {
  name = "NoProfileError";
  constructor() {
    super(
      "You haven't created a profile yet! Use the `!play` command to get started."
    );
  }
}
export class NoProfileOtherError extends ClientError {
  name = "NoProfileOtherError";
  constructor() {
    super("That person hasn't created a profile yet!");
  }
}
export class DuplicateProfileError extends ClientError {
  name = "DuplicateProfileError";
  constructor() {
    super("You've already set up a profile! Use `!profile` to view it.");
  }
}
export class PageOutOfBoundsError extends ClientError {
  name = "PageOutOfBoundsError";
  constructor() {
    super(
      "That isn't a valid page! It must be a number greater than or equal to 1."
    );
  }
}
export class NobodyToHugError extends ClientError {
  name = "NobodyToHugError";
  constructor() {
    super(
      "You can't hug nobody! (*hint: you may have typed an invalid mention*)"
    );
  }
}
export class CantHugYourselfError extends ClientError {
  name = "CantHugYourselfError";
  constructor() {
    super("You can't hug yourself!");
  }
}
export class InvalidPackError extends ClientError {
  name = "InvalidPackError";
  constructor() {
    super(
      "That pack does not exist!\nIf you were trying to buy from the Marketplace, use `!mpb <card reference>`."
    );
  }
}
export class ExpiredPackError extends ClientError {
  name = "ExpiredPackError";
  constructor() {
    super("That pack is no longer available for purchase!");
  }
}
export class InvalidShopItemError extends ClientError {
  name = "InvalidShopItemError";
  constructor() {
    super("That pack does not have a collection attached to it!");
  }
}
export class NotEnoughCoinsError extends ClientError {
  name = "NotEnoughCoinsError";
  constructor() {
    super("You don't have enough coins to buy that!");
  }
}
export class EmptyPackError extends ClientError {
  name = " EmptyPackError";
  constructor() {
    super("That pack is empty!");
  }
}
export class NoPackIDError extends ClientError {
  name = "NoPackIDError";
  constructor() {
    super("Please specify a valid Pack ID (shown in the !shop).");
  }
}
export class NotANumberError extends ClientError {
  name = "NotANumberError";
  constructor() {
    super("Please use a valid number!");
  }
}
export class InvalidCardError extends ClientError {
  name = "InvalidCardError";
  constructor() {
    super("Please enter a valid card ID!");
  }
}
export class NotEnoughHeartsError extends ClientError {
  name = "NotEnoughHeartsError";
  constructor() {
    super("You don't have enough hearts to do that!");
  }
}
export class InvalidUserCardError extends ClientError {
  name = "InvalidUserCardError";
  constructor() {
    super("Please enter a valid card reference (e.g. `DLHJ#32`)");
  }
}
export class InvalidCollectionError extends ClientError {
  name = "InvalidCollectionError";
  constructor() {
    super("That collection does not exist!");
  }
}
export class InvalidImageDataError extends ClientError {
  name = "InvalidImageDataError";
  constructor() {
    super(
      "That card has no image data attached to it. Contact RTFL#8058 to get this fixed!"
    );
  }
}
export class CannotAddYourselfError extends ClientError {
  name = "CannotAddYourselfError";
  constructor() {
    super("You can't add yourself as a friend! :pensive:");
  }
}
export class DuplicateRelationshipError extends ClientError {
  name = "DuplicateRelationshipError";
  constructor() {
    super("You're already friends with that person!");
  }
}
export class CannotRemoveYourselfError extends ClientError {
  name = "CannotRemoveYourselfError";
  constructor() {
    super("Why would you want to do that? :broken_heart:");
  }
}
export class NonexistentRelationshipError extends ClientError {
  name = "NonexistentRelationshipError";
  constructor() {
    super("You aren't friends with that user anyway. :person_shrugging:");
  }
}
export class SendHeartsCooldownError extends ClientError {
  name = "SendHeartsCooldownError";
  constructor(until: number, now: number) {
    super(
      `You must wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before sending hearts again.`
    );
  }
}
export class HeartBoxCooldownError extends ClientError {
  name = "HeartBoxCooldownError";
  constructor(until: number, now: number) {
    super(
      `You must wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before opening your heart boxes again.`
    );
  }
}
export class NotYourCardError extends ClientError {
  name = "NotYourCardError";
  constructor() {
    super("That card doesn't belong to you!");
  }
}
export class OrphanCooldownError extends ClientError {
  name = "OrphanCooldownError";
  constructor(until: number, now: number) {
    super(
      `You must wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before claiming another forfeited card.`
    );
  }
}
export class CardNotOrphanedError extends ClientError {
  name = "CardNotOrphanedError";
  constructor() {
    super(`That card belongs to someone already.`);
  }
}
export class CardNotForSaleError extends ClientError {
  name = "CardNotForSaleError";
  constructor() {
    super(`That card isn't for sale.`);
  }
}
export class CardAlreadyForSaleError extends ClientError {
  name = "CardAlreadyForSaleError";
  constructor() {
    super(`You've already listed that card for sale.`);
  }
}
export class InvalidPriceError extends ClientError {
  name = "InvalidPriceError";
  constructor() {
    super(
      `Please enter a valid price, above 0 Coins and below 2,147,483,647 Coins.`
    );
  }
}
