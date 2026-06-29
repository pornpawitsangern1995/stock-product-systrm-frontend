'use client';

import React, { useState, useEffect  } from 'react';
import "./styles.css";
import { Button, InputNumber, Modal } from 'antd';
//import { it } from 'node:test';
//import axiosInstance from 'axios';


interface ProductItem {
  productId: string;
  productName: string;
  productPrice: number;
  productStock: number;
};

interface AddQtyItem {
  productId: string;
  qty: number;
}

interface CartItems {
  productId: string;
  productName: string;
  productPrice: number;
  qty: number;
  totalPrice: number;
}



export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [qtyItem, setQtyItem] = useState<AddQtyItem[]>([]);
  const [inCartItems, setInCartItems] = useState<CartItems[]>([]);
  //const [errorMsg, setErrorMsg] = useState(null);
  const [openModalOverQty, setOpenModalOverQty] = useState(false);
  const [openModalCart, setOpenModalCart] = useState(false);
  const [openConfirmCheckOutDialog, setOpenConfirmCheckOutDialog] = useState(false);

  const API_URL = 'http://localhost:5100/'; 

  // const boxRender_mock = [
  //   {
  //     id: 1,
  //     name: "a"
  //   },
  //   {
  //     id: 2,
  //     name: "b"
  //   },
  //   {
  //     id: 3,
  //     name: "c"
  //   }
  // ];

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

  const updateData = async (payload: AddQtyItem[]) => {
    fetch(API_URL + 'api/products/update-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(async (result) => {
    if (!result.ok) {
      const errorText = await result.text();
      throw new Error(errorText || 'Cannot update stock!');
    }
    return result.json();
  })
    .then(() => {
      //alert(data.message || 'Check Out Success!');
      setInCartItems([]);
      setProducts([]);
      setOpenModalCart(false);
      setOpenConfirmCheckOutDialog(false);
      getData(); 
    })
    .catch((err) => {
      alert(err.message);
    });
  };
  

  useEffect(() => {
    getData();
  }, []);

  const handleAddToCart = (addNewCartItem: ProductItem) => {
    const findInCart = inCartItems.find((i) => i.productId === addNewCartItem.productId);
    if (findInCart) {
      // for update item in cart
      const productSelect = products.find((i) => i.productId === addNewCartItem.productId);
      const qtySelect = qtyItem.find((i) => i.productId === addNewCartItem.productId);
      const itemQtySelected = qtySelect ? qtySelect.qty : 1;
      if (productSelect) {
        if (itemQtySelected <= productSelect.productStock) {
          // add qty in already cart item;
          findInCart.qty = findInCart.qty + itemQtySelected;
          findInCart.totalPrice = findInCart.qty * findInCart.productPrice;

          // remove from remain stock
          
          
            productSelect.productStock = productSelect.productStock - itemQtySelected;
          

          setProducts([...products]);
        } else {
          setOpenModalOverQty(true);
        }
      }
      
    } else {
      const productSelect = products.find((i) => i.productId === addNewCartItem.productId);
      const qtySelect = qtyItem.find((i) => i.productId === addNewCartItem.productId);
      const itemQtySelected = qtySelect ? qtySelect.qty : 1;

      if (productSelect) {
        if (itemQtySelected <= productSelect.productStock) {
          // remove from stock
          productSelect.productStock = productSelect.productStock - itemQtySelected;

          // add new item in cart
          const newCartItem = {
            productId: productSelect.productId,
            productName: productSelect.productName,
            productPrice: productSelect.productPrice,
            qty: itemQtySelected,
            totalPrice: productSelect.productPrice * itemQtySelected,
          }

          inCartItems.push(newCartItem);

          setProducts([...products])
          setInCartItems(inCartItems);
        } else {
          setOpenModalOverQty(true);
        }
      }
    }
     // clear select qty;
      const updatedQtyItem = qtyItem.filter((i) => i.productId !== addNewCartItem.productId);
      setQtyItem(updatedQtyItem);

  }

  const handleChangeInCart = (value: number, item: CartItems) => {
    const remainQtyInProduct = products.find((i) => i.productId === item.productId);

    if (remainQtyInProduct) {
      // หา stock เดิม
      const defaultStock = remainQtyInProduct.productStock + item.qty;

      // คำนวณ stock ใหม่
      remainQtyInProduct.productStock = defaultStock - value;
      item.qty = value;
      item.totalPrice = value * item.productPrice;

      setProducts([...products]);
      setInCartItems([...inCartItems]);
    }
  }

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

  const handleRemoveItem = (item: CartItems) => {
    const findOtherItem = inCartItems.filter((i) => i.productId !== item.productId);

    // return qty to products
    const findProduct = products.find((i) => i.productId === item.productId);
    if (findProduct) {
      findProduct.productStock += item.qty;
    }

    setProducts([...products]);
    setInCartItems(findOtherItem);
  }

  const handleClearAllCart = () => {
    setQtyItem([]);
    setInCartItems([]);
    getData();
  }

  const handleCheckOut = () => {
    const payload = inCartItems.map((item) => ({
      productId: item.productId,
      qty: item.qty
    }));
    updateData(payload);
  }

  const maxInCart = (item: CartItems) => {
    const remainQtyInProduct = products.find((i) => i.productId === item.productId);
    if (remainQtyInProduct) {
      const maxItemQty = item.qty + remainQtyInProduct.productStock;
      return maxItemQty;
    } else {
      return item.qty;
    }
  }

  const renderProduct = () => {
    return products.map((item) => (
      <div className='product-box' key={item.productId}>
        <h2 className='product-name-text'>{item.productName}</h2>
        <span>In Stock: {item.productStock}</span>
        <h2 className='product-name-text'>Price: {item.productPrice}</h2>
        
        <InputNumber
          defaultValue={item.productStock === 0 ? 0 : 1}
          value={qtyItem.find((i) => i.productId === item.productId)?.qty ?? (item.productStock === 0 ? 0 : 1)}
          //min={item.productStock === 0 ? 0 : 1}
          min={1}
          max={item.productStock} 
          onChange={(value) => handleAddQty(Number(value), item)} 
          disabled={item.productStock === 0}
        >
        </InputNumber>
        <Button
          onClick={() => handleAddToCart(item)}
          disabled={item.productStock === 0}
        >
          Add to Cart
        </Button>
      </div>
    ));
  }

  const renderItemsInCart = () => {
    return inCartItems.map((item) => (
      <div className='item-cart-box' key={item.productId}>
        <h2 className='product-name-text'>{item.productName}</h2>
        <span>Price: {item.productPrice}</span>
        {/* <span>QTY: {item.qty}</span> */}
        QTY:
        <InputNumber
          defaultValue={item.qty}
          min={0}
          max={maxInCart(item)} 
          onChange={(value) => handleChangeInCart(Number(value), item)} 
        >
        </InputNumber>
        <span>Total Price: {item.totalPrice}</span>
        <Button
          onClick={() => handleRemoveItem(item)}
          danger>Remove</Button>
      </div>
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
        <Button onClick={() => setOpenModalCart(true)}>
          My Cart ({inCartItems.length})
        </Button>
      </div>

        {renderProduct()}

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
            <span>Total Price: {renderTotalPrice()}</span>
            <div className='clear-cart-btn'>
              <Button 
                onClick={handleClearAllCart}
                disabled={inCartItems.length === 0}
                danger
              >Clear Cart</Button>

               <Button 
                  onClick={() => setOpenConfirmCheckOutDialog(true)}
                  style={{ backgroundColor: '#00fd22', borderColor: '#000000' }}
                  disabled={inCartItems.length === 0}
                >Check Out</Button>
            </div>
          </Modal>

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
