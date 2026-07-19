export interface ICourseReview {
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
}

export interface ICourseReviewUpdate {
  rating?: number;
  comment?: string;
}

export interface ICourseReviewFilters {
  searchTerm?: string;
  courseId?: string;
  userId?: string;
  rating?: number;
}
