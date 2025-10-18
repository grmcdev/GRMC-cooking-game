import { LevelConfig } from "@/types/game";
import { RECIPES } from "./recipes";

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    duration: 180, // 3 minutes
    targetScore: 32,
    maxActiveOrders: 2,
    availableRecipes: [
      RECIPES.bread,
      RECIPES.mushroomSoup,
      RECIPES.goldenApple
    ]
  },
  {
    level: 2,
    duration: 240, // 4 minutes
    targetScore: 100,
    maxActiveOrders: 3,
    availableRecipes: [
      RECIPES.bread,
      RECIPES.carrotStew,
      RECIPES.mushroomSoup,
      RECIPES.cookedFish,
      RECIPES.goldenApple
    ]
  },
  {
    level: 3,
    duration: 240, // 4 minutes
    targetScore: 130,
    maxActiveOrders: 4,
    availableRecipes: [
      RECIPES.bread,
      RECIPES.carrotStew,
      RECIPES.mushroomSoup,
      RECIPES.cookedFish,
      RECIPES.goldenApple,
      RECIPES.enderPearl
    ]
  }
];
