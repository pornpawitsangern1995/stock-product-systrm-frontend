'use client';
import { Button, InputNumber, Modal } from 'antd';
import type { ProductItem, CartItems } from "@/src/app/types/product";

interface CartModalProps {
  openModalCart: boolean;
  setOpenModalCart: (open: boolean) => void;
  inCartItems: CartItems[];
  products: ProductItem[];
  handleChangeInCart: (value: number, item: CartItems) => void;
  handleRemoveItem: (item: CartItems) => void;
  handleClearAllCart: () => void;
  setOpenConfirmCheckOutDialog: (open: boolean) => void;
  renderTotalPrice: () => number;
}

const CartModal = ({
  openModalCart,
  setOpenModalCart,
  inCartItems,
  products,
  handleChangeInCart,
  handleRemoveItem,
  handleClearAllCart,
  setOpenConfirmCheckOutDialog,
  renderTotalPrice,
}: CartModalProps) => {

  const maxInCart = (item: CartItems) => {
    const remainQtyInProduct = products.find((i) => i.productId === item.productId);
    if (remainQtyInProduct) {
      return item.qty + remainQtyInProduct.productStock;
    }
    return item.qty;
  };

  const renderItemsInCart = () => {
    if (inCartItems.length <= 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <span>ไม่พบสินค้าในตะกร้า</span>
        </div>
      );
    }
    return inCartItems.map((item) => (
      <div className="item-cart-box" key={item.productId}>
        <h2 className="product-name-text">{item.productName}</h2>
        <span>Price: {item.productPrice}</span>
        QTY:
        <InputNumber
          value={item.qty}
          min={0}
          max={maxInCart(item)}
          onChange={(value) => handleChangeInCart(Number(value), item)}
        />
        <span>Total Price: {item.totalPrice}</span>
        <Button onClick={() => handleRemoveItem(item)} danger>
          Remove
        </Button>
      </div>
    ));
  };

  return (
    <Modal
      title="MY CART"
      centered
      open={openModalCart}
      onOk={() => setOpenModalCart(false)}
      onCancel={() => setOpenModalCart(false)}
      width={800}
      footer={null}
    >
      {renderItemsInCart()}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <h2>Total Price: {renderTotalPrice()}</h2>
      </div>

      <div className="clear-cart-btn">
        <Button
          onClick={handleClearAllCart}
          disabled={inCartItems.length === 0}
          danger
        >
          Clear Cart
        </Button>

        <Button
          onClick={() => setOpenConfirmCheckOutDialog(true)}
          style={{ backgroundColor: '#00fd22', borderColor: '#000000' }}
          disabled={inCartItems.length === 0}
        >
          Check Out
        </Button>
      </div>
    </Modal>
  );
};

export default CartModal;