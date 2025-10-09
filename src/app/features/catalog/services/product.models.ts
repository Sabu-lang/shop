// ✅ Product მოდელი მორგებულია Everrest API სტრუქტურაზე

export interface Product {
  _id: string;               // MongoDB ObjectId (ძირითადი გასაღები)
  title: string;             // პროდუქტის სახელი
  description?: string;      // აღწერა
  price: number | {
    current: number;
    beforeDiscount?: number;
  };                         // ფასი (შეიძლება იყოს ობიექტიც)
  brand?: string;            // ბრენდი
  category?: string;         // კატეგორია
  stock?: number;            // მარაგი
  thumbnail?: string;        // მთავარი ფოტო
  images?: string[];         // სურათების მასივი
  rating?: {
    rate: number;
    count: number;
  };                         // რეიტინგი
  discountPercentage?: number; // ფასდაკლება %
  createdAt?: string;
  updatedAt?: string;
}

/* ✅ Review მოდელი — სრულად თავსებადია rating-modal.component.ts-თან */
export interface Review {
  _id?: string;
  productId: string;       // რომელ პროდუქტზეა კომენტარი
  userId?: string;         // მომხმარებლის ID
  userName?: string;       // მომხმარებლის სახელი
  user?: string;           // 🔹 დამატებულია რომ TS2353 აღარ გამოაგდოს
  rating: number;          // შეფასება (1–5)
  comment: string;         // კომენტარი
  createdAt?: string;
  updatedAt?: string;
}

