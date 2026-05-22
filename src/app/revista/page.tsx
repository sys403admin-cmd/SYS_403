import RevistaComponent from './RevistaComponent';
import { getProducts } from '@/lib/actions';

// Forzamos renderizado dinámico para tener siempre data fresca
export const dynamic = 'force-dynamic';

export default async function RevistaPage() {
  const products = await getProducts();
  
  return <RevistaComponent initialProducts={products} />;
}
