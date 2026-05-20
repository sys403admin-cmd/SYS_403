'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from './store';
import { sounds } from './sounds';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color?: string, size?: string) => void;
  removeFromCart: (productId: number, color?: string, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('urban_marca_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('urban_marca_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product: Product, color?: string, size?: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      if (existing) {
        if (existing.quantity < product.stock) {
          sounds.playClick();
          return prev.map(item => 
            item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          sounds.playStatic();
          return prev;
        }
      }
      sounds.playClick();
      return [...prev, { product, quantity: 1, selectedColor: color, selectedSize: size }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number, color?: string, size?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
    ));
    sounds.playStatic();
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, color?: string, size?: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedColor === color && item.selectedSize === size) {
        const newQty = Math.max(1, Math.min(quantity, item.product.stock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => {
    const price = parseFloat(item.product.price.replace('$', ''));
    return acc + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
