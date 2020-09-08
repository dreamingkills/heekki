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
  richestUser: { id: string; coins: number };
  totalRelationships: number;
  topCollector: { id: string; cards: number };
  totalOrphaned: number;
  totalCoins: number;
  triviaCorrect: number;
  triviaWrong: number;
  tradesComplete: number;
  marketSales: number;
  missionsComplete: number;

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
    richestUser: { id: string; coins: number },
    totalRelationships: number,
    topCollector: { id: string; cards: number },
    totalOrphaned: number,
    totalCoins: number,
    triviaCorrect: number,
    triviaWrong: number,
    tradesComplete: number,
    marketSales: number,
    missionsComplete: number
  ) {
    this.totalCards = totalCards;
    this.totalProfiles = totalProfiles;
    this.richestUser = richestUser;
    this.totalRelationships = totalRelationships;
    this.topCollector = topCollector;
    this.totalOrphaned = totalOrphaned;
    this.totalCoins = totalCoins;
    this.triviaCorrect = triviaCorrect;
    this.triviaWrong = triviaWrong;
    this.tradesComplete = tradesComplete;
    this.marketSales = marketSales;
    this.missionsComplete = missionsComplete;
  }
}
