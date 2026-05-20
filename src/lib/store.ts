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
  garmentType: 'CAMISA' | 'BUSO';
  garmentColor: string;
  designs: {
    url: string;
    position: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
    zone: string;
  }[];
  size: string;
  status: string;
  date: string;
}

const STORAGE_KEY_PRODUCTS = 'urban_marca_products';
const STORAGE_KEY_ORDERS = 'urban_marca_orders';

const defaultProducts: Product[] = [
  { 
    id: 1, 
    name: 'Buso Oversize "Medellín Night"', 
    price: '$55.00', 
    category: 'HOODIES', 
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
    description: 'Buso de alto gramaje con estética nocturna. Inspirado en las luces de la ciudad y el movimiento underground.',
    colors: ['#000000', '#1A1A1A', '#333333'],
    soldOut: false,
    stock: 3
  },
  { 
    id: 2, 
    name: 'Camiseta "Concrete Heart"', 
    price: '$35.00', 
    category: 'T-SHIRTS', 
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
    description: 'Camiseta básica pero con corte premium. Representa el corazón de cemento que late en cada barrio.',
    colors: ['#FFFFFF', '#333333', '#C0C0C0'],
    soldOut: false,
    stock: 3
  }
];

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
