import { Recipe } from "@/types/game";

export const RECIPES: Record<string, Recipe> = {
  // EASY RECIPES (6 points)
  bread: {
    id: 'bread',
    name: 'Fresh Bread',
    difficulty: 'easy',
    points: 6,
    timeLimit: 50,
    ingredients: [
      {
        id: 'wheat_1',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      },
      {
        id: 'wheat_2',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      },
      {
        id: 'wheat_3',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      }
    ]
  },

  bakedPotato: {
    id: 'bakedPotato',
    name: 'Baked Potato',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'potato',
        name: 'Potato',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🥔'
      }
    ]
  },

  cookedPorkchop: {
    id: 'cookedPorkchop',
    name: 'Cooked Porkchop',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_porkchop',
        name: 'Raw Porkchop',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🥩'
      }
    ]
  },

  cookedBeef: {
    id: 'cookedBeef',
    name: 'Steak',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_beef',
        name: 'Raw Beef',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🥩'
      }
    ]
  },

  cookedChicken: {
    id: 'cookedChicken',
    name: 'Cooked Chicken',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_chicken',
        name: 'Raw Chicken',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🍗'
      }
    ]
  },

  cookedMutton: {
    id: 'cookedMutton',
    name: 'Cooked Mutton',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_mutton',
        name: 'Raw Mutton',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🍖'
      }
    ]
  },

  cookedSalmon: {
    id: 'cookedSalmon',
    name: 'Cooked Salmon',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_salmon',
        name: 'Raw Salmon',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🐟'
      }
    ]
  },

  cookedCod: {
    id: 'cookedCod',
    name: 'Cooked Cod',
    difficulty: 'easy',
    points: 6,
    timeLimit: 40,
    ingredients: [
      {
        id: 'raw_cod',
        name: 'Raw Cod',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🐠'
      }
    ]
  },
  
  // MEDIUM RECIPES (10 points)
  mushroomSoup: {
    id: 'mushroomSoup',
    name: 'Mushroom Stew',
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
      },
      {
        id: 'bowl',
        name: 'Bowl',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥣'
      }
    ]
  },

  beetrootSoup: {
    id: 'beetrootSoup',
    name: 'Beetroot Soup',
    difficulty: 'medium',
    points: 10,
    timeLimit: 65,
    ingredients: [
      {
        id: 'beetroot_1',
        name: 'Beetroot',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🌰'
      },
      {
        id: 'beetroot_2',
        name: 'Beetroot',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🌰'
      },
      {
        id: 'beetroot_3',
        name: 'Beetroot',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🌰'
      },
      {
        id: 'bowl_beetroot',
        name: 'Bowl',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥣'
      }
    ]
  },
  
  pumpkinPie: {
    id: 'pumpkinPie',
    name: 'Pumpkin Pie',
    difficulty: 'medium',
    points: 10,
    timeLimit: 55,
    ingredients: [
      {
        id: 'pumpkin',
        name: 'Pumpkin',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🎃'
      },
      {
        id: 'sugar_pie',
        name: 'Sugar',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🧂'
      },
      {
        id: 'egg_pie',
        name: 'Egg',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥚'
      }
    ]
  },

  suspiciousStew: {
    id: 'suspiciousStew',
    name: 'Suspicious Stew',
    difficulty: 'medium',
    points: 12,
    timeLimit: 65,
    ingredients: [
      {
        id: 'mushroom_red_sus',
        name: 'Red Mushroom',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🍄'
      },
      {
        id: 'mushroom_brown_sus',
        name: 'Brown Mushroom',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🟫'
      },
      {
        id: 'flower',
        name: 'Flower',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🌸'
      },
      {
        id: 'bowl_sus',
        name: 'Bowl',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥣'
      }
    ]
  },
  
  // HARD RECIPES (16 points)
  goldenApple: {
    id: 'goldenApple',
    name: 'Golden Apple',
    difficulty: 'hard',
    points: 16,
    timeLimit: 80,
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
        id: 'gold_ingot_1',
        name: 'Gold Ingot',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '✨'
      },
      {
        id: 'gold_ingot_2',
        name: 'Gold Ingot',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '✨'
      },
      {
        id: 'gold_ingot_3',
        name: 'Gold Ingot',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '✨'
      },
      {
        id: 'gold_ingot_4',
        name: 'Gold Ingot',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '✨'
      }
    ]
  },

  cake: {
    id: 'cake',
    name: 'Cake',
    difficulty: 'hard',
    points: 18,
    timeLimit: 90,
    ingredients: [
      {
        id: 'milk_1',
        name: 'Milk Bucket',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥛'
      },
      {
        id: 'milk_2',
        name: 'Milk Bucket',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥛'
      },
      {
        id: 'milk_3',
        name: 'Milk Bucket',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥛'
      },
      {
        id: 'sugar_1',
        name: 'Sugar',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🧂'
      },
      {
        id: 'sugar_2',
        name: 'Sugar',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🧂'
      },
      {
        id: 'egg_cake',
        name: 'Egg',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥚'
      },
      {
        id: 'wheat_cake_1',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      },
      {
        id: 'wheat_cake_2',
        name: 'Wheat',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🌾'
      }
    ]
  },

  rabbitStew: {
    id: 'rabbitStew',
    name: 'Rabbit Stew',
    difficulty: 'hard',
    points: 16,
    timeLimit: 85,
    ingredients: [
      {
        id: 'cooked_rabbit',
        name: 'Cooked Rabbit',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🐰'
      },
      {
        id: 'carrot_stew',
        name: 'Carrot',
        type: 'raw',
        needsChopping: true,
        needsCooking: false,
        icon: '🥕'
      },
      {
        id: 'baked_potato_stew',
        name: 'Baked Potato',
        type: 'raw',
        needsChopping: false,
        needsCooking: true,
        cookMethod: 'skillet',
        icon: '🥔'
      },
      {
        id: 'mushroom_stew',
        name: 'Mushroom',
        type: 'raw',
        needsChopping: true,
        needsCooking: true,
        cookMethod: 'cauldron',
        icon: '🍄'
      },
      {
        id: 'bowl_rabbit',
        name: 'Bowl',
        type: 'raw',
        needsChopping: false,
        needsCooking: false,
        icon: '🥣'
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
