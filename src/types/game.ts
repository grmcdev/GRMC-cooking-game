export interface Recipe {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  ingredients: Ingredient[];
  timeLimit: number; // seconds per order
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'raw' | 'chopped' | 'cooked' | 'plated';
  needsChopping: boolean;
  needsCooking: boolean;
  cookMethod?: 'skillet' | 'cauldron';
  icon: string;
}

export interface OrderTicket {
  id: string;
  recipe: Recipe;
  timeRemaining: number;
  completedIngredients: Set<string>;
  isComplete: boolean;
}

export interface IngredientState {
  id: string;
  ingredientId: string;
  type: 'raw' | 'chopped' | 'cooked' | 'plated';
  name: string;
  icon: string;
  needsChopping: boolean;
  needsCooking: boolean;
  cookMethod?: 'skillet' | 'cauldron';
}

export interface StationState {
  id: string;
  type: 'crate' | 'cutting' | 'skillet' | 'cauldron' | 'plating';
  ingredient?: IngredientState;
  progress?: number; // 0-100 for cooking/chopping
  isActive: boolean;
}

export interface GameState {
  level: number;
  score: number;
  targetScore: number;
  timeLimit: number;
  timeRemaining: number;
  orders: OrderTicket[];
  isPlaying: boolean;
  isPaused: boolean;
  playerHand?: IngredientState;
  stations: StationState[];
}

export interface LevelConfig {
  level: number;
  duration: number; // seconds
  targetScore: number;
  availableRecipes: Recipe[];
  maxActiveOrders: number;
}
