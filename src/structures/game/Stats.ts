export class Stats {
  totalCards: {
    total: number;
    sixStars: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
  totalProfiles: number;
  totalRelationships: number;
  tradesComplete: number;

  constructor(
    totalCards: {
      total: number;
      sixStars: number;
      fiveStars: number;
      fourStars: number;
      threeStars: number;
      twoStars: number;
      oneStar: number;
    },
    totalProfiles: number,
    totalRelationships: number,
    tradesComplete: number
  ) {
    this.totalCards = totalCards;
    this.totalProfiles = totalProfiles;
    this.totalRelationships = totalRelationships;
    this.tradesComplete = tradesComplete;
  }
}
