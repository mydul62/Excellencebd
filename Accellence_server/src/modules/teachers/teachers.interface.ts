export interface ICreateTeacher {
  // User account fields
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  phone?: string | null;
  // Teacher profile fields
  subject: string;
  bio?: string | null;
  experienceYears?: number;
  qualification?: string | null;
  joinedAt?: Date;
}

export interface IUpdateTeacher {
  // User account fields (optional on update)
  name?: string;
  avatar?: string | null;
  phone?: string | null;
  // Teacher profile fields
  subject?: string;
  bio?: string | null;
  experienceYears?: number;
  qualification?: string | null;
}

export interface ITeacherFilters {
  searchTerm?: string;
  subject?: string;
}
