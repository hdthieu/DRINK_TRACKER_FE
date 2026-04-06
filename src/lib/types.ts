export enum ActivityType {
    GENERAL = "GENERAL",
    MEAL = "MEAL",
    EXERCISE = "EXERCISE",
    WATER = "WATER",
}

export enum MealType {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    SNACK = "SNACK",
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    dailyCaffeineLimit: number;
    dailySugarLimit: number;
    weight: number;
    age?: number;
    exerciseTimeMinutes: number;
    isHighTemperature: boolean;
    imageUrl?: string;
    dailyWaterGoal?: number;
    isWaterReminderEnabled: boolean;
    reminderStartTime: string;
    reminderEndTime: string;
    reminderInterval: number;
}

export interface DrinkLog {
    id: string;
    drinkName: string;
    caffeineMg: number;
    sugarG: number;
    calories: number;
    volumeMl: number;
    price: number;
    rating: number;
    size?: string;
    temperature?: string;
    createdAt: string;
}

export interface InventoryUnit {
    id: string;
    symbol: string;
    label: string;
}

export interface InventoryItem {
    id: string;
    itemName: string;
    quantityInBaseUnit: number;
    baseUnitSymbol: string;
    displayUnitSymbol?: string;
    lowStockThreshold?: number;
}

export interface MealIngredient {
    id: string;
    inventoryItemId: string;
    inventoryItem: InventoryItem;
    amountInBaseUnit: number;
    unitSymbol: string;
}

export interface MealPlan {
    id: string;
    dayOfWeek: number;
    mealType: string;
    mealName: string;
    description?: string;
    ingredients: MealIngredient[];
}

export interface UserRoadmap {
    id: string;
    time: string;
    activityName: string;
    description?: string;
    activityType: ActivityType;
    mealPlanId?: string;
    mealPlan?: MealPlan;
    isCompleted: boolean;
    date: string;
}

export interface CreateRoadmapDto {
    time: string;
    activityName: string;
    description?: string;
    activityType: ActivityType;
    mealPlanId?: string;
    date: string;
}

export interface UpdateRoadmapDto {
    time?: string;
    activityName?: string;
    description?: string;
    activityType?: ActivityType;
    mealPlanId?: string;
    isCompleted?: boolean;
    date?: string;
}
