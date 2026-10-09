'use client';
import { useState, useEffect  } from 'react';
import "./styles.css";
import { Button, Modal } from 'antd'; //InputNumber,
import ItemBox from "@/src/app/components/ItemBox"
import CartModal from "@/src/app/components/CartModal";
import type { ProductItem, AddQtyItem, CartItems } from "@/src/app/types/product";
import { ShoppingCartOutlined } from '@ant-design/icons';

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [qtyItem, setQtyItem] = useState<AddQtyItem[]>([]);
  const [inCartItems, setInCartItems] = useState<CartItems[]>([]);
  const [openModalOverQty, setOpenModalOverQty] = useState(false);
  const [openModalCart, setOpenModalCart] = useState(false);
  const [openConfirmCheckOutDialog, setOpenConfirmCheckOutDialog] = useState(false);

  const [loadingCart, setLoadingCart] = useState(false);

  const API_URL = 'http://localhost:5100/'; 

  const getData = () => {
    fetch(API_URL + 'api/products')
    .then((result) => {
      if (!result.ok) {
        throw new Error('Cannot get data!');
      }
      return result.json();
    })
    .then((data) => {
      setProducts(data);
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  // const updateData = async (payload: AddQtyItem[]) => {
  //   fetch(API_URL + 'api/products/update-stock', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(payload)
  //   }).then(async (result) => {
  //   if (!result.ok) {
  //     const errorText = await result.text();
  //     throw new Error(errorText || 'Cannot update stock!');
  //   }
  //   return result.json();
  // })
  //   .then(() => {
  //     setInCartItems([]);
  //     setProducts([]);
  //     setOpenModalCart(false);
  //     setOpenConfirmCheckOutDialog(false);
  //     getData(); 
  //   })
  //   .catch((err) => {
  //     alert(err.message);
  //   });
  // };

  const getShoppingCart = async () => {

    try {
      setLoadingCart(true);
      const result = await fetch(
        API_URL + 'api/products/shopping-cart'
      );

      if (!result.ok) {

        const errorText = await result.text();

        throw new Error(
          errorText || 'Cannot get shopping cart!'
        );
      }

      const data = await result.json();

      setInCartItems(data);

    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : 'Cannot get shopping cart!'
      );

    } finally {

      setLoadingCart(false);

    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getData(),
        getShoppingCart()
      ]);
    };

    loadData();
  }, []);

  const handleAddToCart = async (addNewCartItem: ProductItem) => {
    const qtySelect = qtyItem.find(
      (i) => i.productId === addNewCartItem.productId
    );

    const itemQtySelected = qtySelect?.qty ?? 1;

    if (itemQtySelected <= 0) {
      return;
    }

    try {

      const result = await fetch(
        API_URL + 'api/products/shopping-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: addNewCartItem.productId,
            qty: itemQtySelected
          })
        }
      );

      if (!result.ok) {

        const errorData =
          await result.json().catch(() => null);

        throw new Error(
          errorData?.message ||
          'Cannot add product to cart!'
        );
      }

      // โหลด Cart จาก DB ใหม่
      await getShoppingCart();

      // clear qty ที่เลือก
      setQtyItem((prev) =>
        prev.filter(
          (i) =>
            i.productId !== addNewCartItem.productId
        )
      );

    } catch (err) {

      console.error(err);

      setOpenModalOverQty(true);
    }
  };

  const handleChangeInCart = async (
    value: number,
    item: CartItems
  ) => {

    try {

      const result = await fetch(
        API_URL +
        `api/products/shopping-cart/${encodeURIComponent(
          item.productId
        )}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            qty: value
          })
        }
      );

      if (!result.ok) {

        const errorData =
          await result.json().catch(() => null);

        throw new Error(
          errorData?.message ||
          'Cannot update cart!'
        );
      }

      // โหลดข้อมูลล่าสุดจาก DB
      await getShoppingCart();

    } catch (err) {

      console.error(err);
      setOpenModalOverQty(true);

      // เอาค่าจริงจาก DB กลับมา
      await getShoppingCart();
    }
  };

  const handleAddQty = (value: number, item: ProductItem) => {
    const prev_qty = qtyItem.find((i) => i.productId === item.productId);

    if (prev_qty) {
      prev_qty.qty = value;
      setQtyItem([...qtyItem]); 
    } else {
      const tmp_item = {
        productId: item.productId,
        qty: value,
      };
      setQtyItem([...qtyItem, tmp_item]); 
    }
  };

  const handleRemoveItem = async (item: CartItems) => {
    try {

      const result = await fetch(
        API_URL +
        `api/products/shopping-cart/${encodeURIComponent(
          item.productId
        )}`,
        {
          method: 'DELETE'
        }
      );

      if (!result.ok) {

        const errorText =
          await result.text();

        throw new Error(
          errorText ||
          'Cannot remove item!'
        );
      }

      await getShoppingCart();

    } 
    catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : 'Cannot remove item!'
      );
    }
  };

  const handleClearAllCart = async () => {
    try {

      const result = await fetch(
        API_URL + 'api/products/shopping-cart',
        {
          method: 'DELETE'
        }
      );

      if (!result.ok) {

        const errorText =
          await result.text();

        throw new Error(
          errorText ||
          'Cannot clear cart!'
        );
      }

      setQtyItem([]);
      setInCartItems([]);

    } 
    catch (err) {
      alert(err instanceof Error ? err.message : 'Cannot clear cart!');
    }
  };

  const handleCheckOut = async () => {
    try {

      const result = await fetch(
        API_URL + 'api/products/checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!result.ok) {

        const errorData = await result.json().catch(() => null);

        throw new Error(errorData?.message || 'Checkout failed!');
      }

      // Checkout สำเร็จ
      setInCartItems([]);
      setQtyItem([]);

      setOpenModalCart(false);
      setOpenConfirmCheckOutDialog(false);

      // โหลด stock ใหม่
      getData();

    } 
    catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : 'Checkout failed!'
      );

      // กรณี stock เปลี่ยนระหว่างรอ checkout
      await getShoppingCart();
    }
  };

  const renderProduct = () => {
    return products.map((product) => (
      <ItemBox
        key={product.productId}
        product={product}
        qty={qtyItem.find((q) => q.productId === product.productId)?.qty ?? (product.productStock > 0 ? 1 : 0)}
        onQtyChange={(qty) => handleAddQty(qty, product)}
        onAddToCart={() => handleAddToCart(product)}
      />
    ));
  }

  const renderTotalPrice = () => {
    if (inCartItems.length !== 0) {
      let totalPriceInCart = 0;
      inCartItems.map((i) => {
        totalPriceInCart += i.totalPrice;
      });
      return totalPriceInCart;
    } else {
      return 0;
    }
  }

  return (
    <div className='products-container '>
      <div className="header-row">
        <h1 className="title">Product & Stock System.</h1>
        <Button
          onClick={async () => {
            setOpenModalCart(true);
            await getShoppingCart();
          }} loading={loadingCart}>
          <ShoppingCartOutlined /> My Cart ({inCartItems.length})
        </Button>
        
      </div>

        {renderProduct()}

        <CartModal
          openModalCart={openModalCart}
          setOpenModalCart={setOpenModalCart}
          inCartItems={inCartItems}
          products={products}
          handleChangeInCart={handleChangeInCart}
          handleRemoveItem={handleRemoveItem}
          handleClearAllCart={handleClearAllCart}
          setOpenConfirmCheckOutDialog={setOpenConfirmCheckOutDialog}
          renderTotalPrice={renderTotalPrice}
        />

        <Modal
          title="Over Stock!"
          centered
          open={openModalOverQty}
          onOk={() => setOpenModalOverQty(false)}
          onCancel={() => setOpenModalOverQty(false)}
          width={500}
        >
          <p>จำนวนที่เลือกเกินจากจำนวนในคลัง</p>
        </Modal>

        <Modal
          title="ยืนยันยอดครั้งสุดท้าย!"
          centered
          open={openConfirmCheckOutDialog}
          onOk={() => handleCheckOut()}
          onCancel={() => setOpenConfirmCheckOutDialog(false)}
          width={500}
        >
          <h2>ยอดรวมทั้งหมดที่ต้องชำระ {renderTotalPrice()} บาท</h2>
        </Modal>
    </div>

    
  );
}

export default ProductsPage;
