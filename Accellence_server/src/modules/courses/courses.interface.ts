import { CourseLevel } from '../../generated/prisma';

export interface ICourse {
  title: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  level: CourseLevel;
  icon?: string;
  seats: number;
  rating?: number;
  popular?: boolean;
}

export interface ICourseFilters {
  searchTerm?: string;
  category?: string;
  level?: CourseLevel;
  popular?: boolean;
}


