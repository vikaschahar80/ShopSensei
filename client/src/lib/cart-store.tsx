import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

interface CartState {
  items: CartItemWithProduct[];
  isOpen: boolean;
  userId: string | null;
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItemWithProduct[] }
  | { type: "ADD_ITEM"; payload: CartItemWithProduct }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "SET_USER"; payload: string | null };

const initialState: CartState = {
  items: [],
  isOpen: false,
  userId: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, items: action.payload };
    case "ADD_ITEM":
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "SET_USER":
      return { ...state, userId: action.payload, items: [] };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("shopai_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: "SET_USER", payload: user.id });
    }
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function useCartHelpers() {
  const { state, dispatch } = useCart();

  const total = state.items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: state.items,
    isOpen: state.isOpen,
    userId: state.userId,
    total: total.toFixed(2),
    itemCount,
    dispatch,
  };
}
