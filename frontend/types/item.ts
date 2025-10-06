export interface Item {
  id: string;
  name: string;
  category: string;
  value: number;
  purchaseDate: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  category: string;
  value: number;
  purchaseDate: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}
