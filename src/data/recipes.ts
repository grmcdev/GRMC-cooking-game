import { Recipe } from "@/types/game";

export const RECIPES: Record<string, Recipe> = {
  // EASY RECIPES (6 points)
  bread: {
    id: 'bread',
    name: 'Fresh Bread',
    difficulty: 'easy',
    points: 6,
    timeLimit: 45,
    ingredients: [
      {
        id: 'wheat',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      }
    ]
  },
  
  carrotStew: {
    id: 'carrotStew',
    name: 'Carrot Stew',
    difficulty: 'easy',
    points: 6,
    timeLimit: 45,
    ingredients: [
      {
        id: 'carrot',
        name: 'Carrot',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🥕'
      }
    ]
  },
  
  // MEDIUM RECIPES (10 points)
  mushroomSoup: {
    id: 'mushroomSoup',
    name: 'Mushroom Soup',
    difficulty: 'medium',
    points: 10,
    timeLimit: 60,
    ingredients: [
      {
        id: 'mushroom_red',
        name: 'Red Mushroom',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🍄'
      },
      {
        id: 'mushroom_brown',
        name: 'Brown Mushroom',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🟫'
      }
    ]
  },
  
  cookedFish: {
    id: 'cookedFish',
    name: 'Cooked Fish',
    difficulty: 'medium',
    points: 10,
    timeLimit: 55,
    ingredients: [
      {
        id: 'fish',
        name: 'Raw Fish',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🐟'
      },
      {
        id: 'kelp',
        name: 'Kelp',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🌿'
      }
    ]
  },
  
  // HARD RECIPES (16 points)
  goldenApple: {
    id: 'goldenApple',
    name: 'Golden Apple',
    difficulty: 'hard',
    points: 16,
    timeLimit: 75,
    ingredients: [
      {
        id: 'apple',
        name: 'Apple',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🍎'
      },
      {
        id: 'gold_ingot',
        name: 'Gold Ingot',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '✨'
      },
      {
        id: 'honey',
        name: 'Honey',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🍯'
      }
    ]
  },
  
  enderPearl: {
    id: 'enderPearl',
    name: 'Ender Pearl Delight',
    difficulty: 'hard',
    points: 16,
    timeLimit: 70,
    ingredients: [
      {
        id: 'ender_pearl',
        name: 'Ender Pearl',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🔮'
      },
      {
        id: 'chorus_fruit',
        name: 'Chorus Fruit',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🍇'
      },
      {
        id: 'glowstone',
        name: 'Glowstone Dust',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '💫'
      }
    ]
  }
};
