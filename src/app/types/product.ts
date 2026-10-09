export interface ProductItem {
  productId: string;
  productName: string;
  productPrice: number;
  productStock: number;
};

export interface AddQtyItem {
  productId: string;
  qty: number;
}

export interface CartItems {
  productId: string;
  productName: string;
  productPrice: number;
  qty: number;
  totalPrice: number;
}