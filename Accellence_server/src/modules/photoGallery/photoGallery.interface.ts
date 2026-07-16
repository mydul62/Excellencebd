export interface IPhotoGalleryItem {
  id?: string;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  publicId: string;
  category?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPhotoGalleryFilters {
  searchTerm?: string;
  category?: string;
  page?: number;
  limit?: number;
}
