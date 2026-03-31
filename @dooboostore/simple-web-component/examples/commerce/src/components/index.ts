import Header from "./Header";
import CartButton from "./CartButton";
import ProductCard from "./ProductCard";

export * from './CartButton';
export * from './Header';
export * from './ProductCard';

export const componentFactories = [
  Header,
  CartButton,
  ProductCard,
];