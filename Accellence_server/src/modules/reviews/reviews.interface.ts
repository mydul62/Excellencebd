export interface IReview {
  name: string;
  avatar?: string | null;
  role?: string | null;
  rating: number;
  comment: string;
  featured?: boolean;
  userId?: string;
  courseId?: string;
}

export interface IReviewFilters {
  searchTerm?: string;
  featured?: boolean;
  courseId?: string;
  userId?: string;
}
