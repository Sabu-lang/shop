export interface Product {
  _id: string;               
  title: string;             
  description?: string;      
  price: number | {
    current: number;
    beforeDiscount?: number;
  };                         
  brand?: string;           
  category?: string;        
  stock?: number;            
  thumbnail?: string;       
  images?: string[];        
  rating?: {
    rate: number;
    count: number;
  };                       
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}


export interface Review {
  _id?: string;
  productId: string;       
  userId?: string;         
  userName?: string;      
  user?: string;          
  rating: number;         
  comment: string;       
  createdAt?: string;
  updatedAt?: string;
}

