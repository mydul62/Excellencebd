export interface IPaymentMethod {
  name: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  instructions?: string;
  logo?: string;
  isActive?: boolean;
}

export interface IPaymentMethodUpdate {
  name?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
  instructions?: string;
  logo?: string;
  isActive?: boolean;
}

export interface IPaymentMethodFilters {
  searchTerm?: string;
  isActive?: boolean;
  accountType?: string;
}
