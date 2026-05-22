// Updated store to include per-product color management and persistence
export interface Product {
  id: number;
  name: string;
  price: string;
  category: 'T-SHIRTS' | 'HOODIES';
  images: string[];
  description: string;
  colors: string[]; 
  soldOut?: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CustomOrder {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  garmenttype: 'CAMISA' | 'BUSO' | 'CATALOGO';
  garmentcolor: string;
  designs: string | any[]; // JSON string from DB or array
  size: string;
  status: string;
  date: string;
}

const STORAGE_KEY_PRODUCTS = 'urban_marca_products';
const STORAGE_KEY_ORDERS = 'urban_marca_orders';

const defaultProducts: Product[] = [];

// Helper to get from localStorage safely
const getStored = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

export let products: Product[] = getStored(STORAGE_KEY_PRODUCTS, defaultProducts);
export const customOrders: CustomOrder[] = getStored(STORAGE_KEY_ORDERS, []);

export const updateProducts = (newProducts: Product[]) => {
  products = [...newProducts];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }
};

export const addOrder = (order: CustomOrder) => {
  const newOrder = { ...order, id: Date.now(), status: 'Pendiente', date: new Date().toLocaleDateString() };
  customOrders.push(newOrder);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(customOrders));
  }
};
