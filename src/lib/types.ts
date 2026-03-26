export enum ActivityType {
    GENERAL = 'GENERAL',
    MEAL = 'MEAL',
    EXERCISE = 'EXERCISE',
    WATER = 'WATER',
}

export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK',
}

export interface UserRoadmap {
    id: string;
    time: string; // "HH:mm"
    activityName: string;
    description?: string;
    activityType: ActivityType;
    isCompleted: boolean;
    date: string; // YYYY-MM-DD
}

export interface CreateRoadmapDto {
    time: string;
    activityName: string;
    description?: string;
    activityType: ActivityType;
    date: string;
}

export interface UpdateRoadmapDto {
    time?: string;
    activityName?: string;
    description?: string;
    activityType?: ActivityType;
    isCompleted?: boolean;
    date?: string;
}
