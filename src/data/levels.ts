import { LevelConfig } from "@/types/game";
import { RECIPES } from "./recipes";

export const LEVELS: LevelConfig[] = [
  {
    level: 0,
    duration: 300, // 5 minutes for tutorial
    targetScore: 20,
    maxActiveOrders: 1,
    availableRecipes: [
      RECIPES.bread, // Simple recipe for tutorial
    ]
  },
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
      RECIPES.beetrootSoup,
      RECIPES.mushroomSoup,
      RECIPES.cookedSalmon,
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
      RECIPES.beetrootSoup,
      RECIPES.mushroomSoup,
      RECIPES.cookedCod,
      RECIPES.goldenApple,
      RECIPES.cake
    ]
  },
  {
    level: 4,
    duration: 300, // 5 minutes
    targetScore: 180,
    maxActiveOrders: 4,
    availableRecipes: [
      RECIPES.beetrootSoup,
      RECIPES.mushroomSoup,
      RECIPES.cookedSalmon,
      RECIPES.goldenApple,
      RECIPES.cake
    ]
  },
  {
    level: 5,
    duration: 300, // 5 minutes
    targetScore: 220,
    maxActiveOrders: 5,
    availableRecipes: [
      RECIPES.mushroomSoup,
      RECIPES.cookedCod,
      RECIPES.goldenApple,
      RECIPES.rabbitStew
    ]
  },
  {
    level: 6,
    duration: 360, // 6 minutes
    targetScore: 280,
    maxActiveOrders: 5,
    availableRecipes: [
      RECIPES.mushroomSoup,
      RECIPES.cookedSalmon,
      RECIPES.goldenApple,
      RECIPES.cake
    ]
  },
  {
    level: 7,
    duration: 360, // 6 minutes
    targetScore: 320,
    maxActiveOrders: 6,
    availableRecipes: [
      RECIPES.cookedCod,
      RECIPES.goldenApple,
      RECIPES.rabbitStew
    ]
  },
  {
    level: 8,
    duration: 420, // 7 minutes
    targetScore: 400,
    maxActiveOrders: 6,
    availableRecipes: [
      RECIPES.cookedSalmon,
      RECIPES.goldenApple,
      RECIPES.cake
    ]
  },
  {
    level: 9,
    duration: 420, // 7 minutes
    targetScore: 480,
    maxActiveOrders: 7,
    availableRecipes: [
      RECIPES.goldenApple,
      RECIPES.rabbitStew
    ]
  },
  {
    level: 10,
    duration: 480, // 8 minutes
    targetScore: 600,
    maxActiveOrders: 8,
    availableRecipes: [
      RECIPES.goldenApple,
      RECIPES.cake
    ]
  }
];
