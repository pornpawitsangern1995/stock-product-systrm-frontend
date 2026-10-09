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

export interface ShoppingOrder {
  orderId: number;
  productId: string;
  productName: string;
  productPrice: number;
  totalPrice: number;
  qty: number;
  orderDate: string;
}