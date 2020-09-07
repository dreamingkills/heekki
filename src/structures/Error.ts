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
export class NotEnoughHeartsError extends ClientError {
  name = "NotEnoughHeartsError";
  constructor() {
    super("You don't have enough hearts to do that!");
  }
}
export class InvalidUserCardError extends ClientError {
  name = "InvalidUserCardError";
  constructor(reference: { abbreviation: string; serial: number }) {
    super(
      `I couldn't find **${reference.abbreviation}#${reference.serial}**! Please make sure you entered it correctly.`
    );
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
export class MissionCooldownError extends ClientError {
  name = "MissionCooldownError";
  constructor(until: number, now: number) {
    super(
      `You must wait **${moment(until).diff(
        now,
        "minutes"
      )} minutes** before embarking upon another mission.`
    );
  }
}
export class NotYourCardInTradeError extends ClientError {
  name = "NotYourCardInTradeError";
  constructor() {
    super(
      `One or more of the cards you specified on your side of the trade do not belong to you.`
    );
  }
}
export class InconsistentCardOwnerOnRightSideOfTradeError extends ClientError {
  name = "InconsistentCardOwnerOnRightSideOfTradeError";
  constructor() {
    super(
      `The cards you specified on the right side of the trade do not all belong to the same person.`
    );
  }
}
export class CannotTradeWithYourselfError extends ClientError {
  name = "CannotTradeWithYourselfError";
  constructor() {
    super(`You can't trade with yourself!`);
  }
}
export class LeftSideCardIsOnMarketplaceError extends ClientError {
  name = "LeftSideCardIsOnMarketplaceError";
  constructor() {
    super(
      `One or more of the cards you specified the left side of your trade are currently on the marketplace and cannot be traded.`
    );
  }
}
export class RightSideCardIsOnMarketplaceError extends ClientError {
  name = "RightSideCardIsOnMarketplaceError";
  constructor() {
    super(
      `One or more of the cards you specified on the right side of your trade are currently on the marketplace and cannot be traded.`
    );
  }
}
export class TradeDoesNotExistError extends ClientError {
  name = "TradeDoesNotExistError";
  constructor() {
    super(
      "That trade does not exist. It may already have been accepted.\nPlease verify that you entered the ID correctly."
    );
  }
}
export class NotYourTradeToAcceptError extends ClientError {
  name = "NotYourTradeToAcceptError";
  constructor() {
    super(`That is not your trade to accept.`);
  }
}
export class NotYourTradeToRejectError extends ClientError {
  name = "NotYourTradeToRejectError";
  constructor() {
    super(`That is not your trade to reject or cancel.`);
  }
}
export class CannotTradeForOrphanedCardError extends ClientError {
  name = "CannotTradeForOrphanedCardError";
  constructor() {
    super(
      `You can't trade for an orphaned card. Use \`!cf <card reference>\` instead.`
    );
  }
}
export class DailyCooldownError extends ClientError {
  name = "DailyCooldownError";
  constructor(until: number, now: number) {
    super(
      `You must wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before claiming your daily reward again.`
    );
  }
}
export class FavoriteCardError extends ClientError {
  name = "FavoriteCardError";
  constructor() {
    super(
      `That card is favorited!\nUse \`!favorite <card reference>\` to unfavorite.`
    );
  }
}
export class FavoriteCardOnLeftSideOfTradeError extends ClientError {
  name = "FavoriteCardOnLeftSideOfTradeError";
  constructor() {
    super(
      `One of the cards on the left side of your trade is favorited!\nUse \`!favorite <card reference>\` to unfavorite.`
    );
  }
}
export class FavoriteCardOnRightSideOfTradeError extends ClientError {
  name = "FavoriteCardOnRightSideOfTradeError";
  constructor() {
    super(`One of the cards on the right side of your trade is favorited!`);
  }
}
export class CardOnMarketplaceError extends ClientError {
  name = "CardOnMarketplaceError";
  constructor() {
    super(
      `That card is currently on the Marketplace.\nTo unlist it, use \`!unlist <card reference>\`.`
    );
  }
}
