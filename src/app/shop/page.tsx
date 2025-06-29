"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@/app/_types/Product";
import { CartItem } from "@/app/_types/CartItem";
import {
  faSpinner,
  faCartShopping,
  faPlus,
  faMinus,
  faBookSkull,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { ApiResponse } from "../_types/ApiResponse";
import useSWR, { mutate } from "swr";

const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetcher = useCallback(async (endPoint: string) => {
    const res = await fetch(endPoint, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return res.json();
  }, []);

  // カート情報の取得
  const { data: cart, isLoading: isCartLoading } = useSWR<
    ApiResponse<CartItem[]>
  >("/api/cart", fetcher);

  // 商品情報の取得 💡SWRに書き換えてみよう
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data: ApiResponse<Product[]> = await res.json();
        if (data.success) {
          setProducts(data.payload);
        } else {
          console.error(data.message);
        }
      } catch (e) {
        console.error("商品取得失敗", e);
      } finally {
        setIsProductLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // カート情報の取得
  useEffect(() => {
    if (cart && cart.success) setCartItems(cart.payload);
  }, [cart]);

  // カートの商品数量の更新（追加・減少）
  const updateCartQuantity = async (productId: string, quantity: number) => {
    const targetCartItem = cartItems.find((ci) => ci.productId === productId);
    const newQuantity = (targetCartItem?.quantity || 0) + quantity;
    if (newQuantity < 0) return;
    await sendCartUpdate({ productId, quantity: newQuantity });
  };

  // カート情報の更新 💡楽観的UI更新（オプティミスティック）を導入してみよう
  const sendCartUpdate = async (cartItem: CartItem) => {
    setIsSending(true);
    const res = await fetch("/api/cart", {
      method: "PATCH",
      body: JSON.stringify(cartItem),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      cache: "no-store",
    });
    const data: ApiResponse<null> = await res.json();
    mutate("/api/cart");
    if (!data.success) {
      console.error(data.message);
    }
    setIsSending(false);
  };

  // 読込中の画面表示
  if (isProductLoading || isCartLoading) {
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faCartShopping} className="mr-1.5" />
          Shop
        </div>
        <div className="mt-4 flex items-center gap-x-2">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-gray-500"
          />
          <div>Loading... </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faCartShopping} className="mr-1.5" />
        Shop
      </div>
      <div className="mt-4 flex flex-col gap-y-2">
        {products.map((p) => {
          const quantity =
            cartItems.find((ci) => ci.productId === p.id)?.quantity || 0;
          return (
            <div key={p.id} className="border px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex justify-center">
                  <div className="text font-bold">
                    <FontAwesomeIcon icon={faBookSkull} className="mr-1.5" />
                    {p.name}
                  </div>
                </div>

                <div className="gat-x-4 flex items-center gap-x-4">
                  <div className="text-blue-500">
                    {p.price.toLocaleString()}円
                  </div>
                  <div className="flex items-center gap-x-1">
                    {[
                      { icon: faPlus, amount: +1 },
                      { icon: faMinus, amount: -1 },
                    ].map(({ icon, amount }) => (
                      <button
                        key={String(amount)}
                        type="button"
                        disabled={isSending}
                        className={twMerge(
                          "cursor-pointer",
                          "rounded-full px-1 text-sm",
                          "bg-blue-500 text-white hover:bg-blue-700",
                          quantity === 0 &&
                            amount === -1 &&
                            "cursor-not-allowed bg-gray-300 hover:bg-gray-300",
                          isSending && "cursor-wait",
                        )}
                        onClick={() => updateCartQuantity(p.id, amount)}
                      >
                        <FontAwesomeIcon icon={icon} />
                      </button>
                    ))}
                  </div>
                  <div className="w-9 text-right font-bold">{quantity} 個</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Page;
