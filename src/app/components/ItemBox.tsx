"use client";

import { Button, InputNumber } from "antd";
import type { ProductItem } from "../types/product";

interface ItemBoxProps {
  product: ProductItem;
  qty: number;
  onQtyChange: (value: number) => void;
  onAddToCart: () => void;
}

const ItemBox = ({
  product,
  qty,
  onQtyChange,
  onAddToCart,
}: ItemBoxProps) => {
    return (
        <>
            <div 
                className='product-box' 
                key={product.productId}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h2 className='product-name-text' style={{ margin: 0 }}>{product.productName}</h2>
                    <span style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    In Stock: {product.productStock}
                    </span>
                </div>

                <h2 className='product-name-text' style={{ width: '150px', margin: 0, textAlign: 'left' }}>
                    Price: {product.productPrice}
                </h2>

                <div style={{ width: '120px' }}>
                    <InputNumber
                    defaultValue={product.productStock === 0 ? 0 : 1}
                    value={qty}
                    min={1}
                    max={product.productStock}
                    onChange={(value) => onQtyChange(Number(value))}
                    disabled={product.productStock === 0}
                    style={{ width: '100px' }}
                    />
                </div>

                <div style={{ width: '120px', textAlign: 'right' }}>
                    <Button
                    onClick={() => onAddToCart()}
                    disabled={product.productStock === 0}
                    >
                    Add to Cart
                    </Button>
                </div>
            </div>
        </>
    );
}

export default ItemBox;