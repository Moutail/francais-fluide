 // src/types/gamification.ts
 
 // Achievement types used by hooks and store
 export type AchievementRequirementType =
   | 'words_written'
   | 'exercises_completed'
   | 'streak'
   | 'level'
   | 'accuracy';
 
 export interface AchievementRequirement {
   type: AchievementRequirementType;
   value: number;
 }
 
 export interface Achievement {
   id: string;
   name: string;
   description: string;
   icon?: string;
   category?: string;
   requirement: AchievementRequirement;
   // Progress tracking
   progress?: number;
   maxProgress?: number;
   unlockedAt?: Date;
 }
 
 // Mission types used by store and UI
 export type MissionType = 'daily' | 'weekly' | 'special';
 
 export interface MissionObjective {
   id: string;
   description: string;
   target: number;
   current: number;
   completed: boolean;
 }
 
 export interface MissionReward {
   type: 'points' | 'badge';
   value: number | string;
   description?: string;
 }
 
 export interface Mission {
   id: string;
   title: string;
   description: string;
   type: MissionType;
   objectives: MissionObjective[];
   reward: MissionReward;
   expiresIn?: string; // e.g., '18h', '4j'
   completedAt?: Date;
 }
 
