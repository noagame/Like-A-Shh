export class Review {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly eventId: string,
    public readonly rating: number,
    public readonly comment: string | null,
    public readonly recommendation: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  public static calcularPromedio(reviews: Review[]): number {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }
}
