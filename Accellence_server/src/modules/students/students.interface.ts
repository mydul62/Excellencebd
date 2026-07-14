export interface ICreateStudent {
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  avatar?: string | null;
  guardian?: string | null;
  address?: string | null;
  status?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  department?: string | null;
  subject?: string | null;
}

export interface IUpdateStudent {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  guardian?: string | null;
  address?: string | null;
  status?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  department?: string | null;
  subject?: string | null;
}

export interface IStudentFilters {
  searchTerm?: string;
  email?: string;
  status?: string;
}
