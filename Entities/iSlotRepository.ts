import { Types } from "mongoose";
import { slot } from "../Interfaces/slot";
import { Lock } from "../Interfaces/lock";

export interface IslotRepository {
  createSlot(slot: slot): Promise<slot>;
  getSlotsById(id: string): Promise<slot | null>;
  getSlotsByDoctorId(doctorId: string): Promise<slot[]>;
  deletePastSlots(doctorId: string, currentDate: Date): Promise<void>;
  updateSlotStatus(slotId: string, status: string): Promise<slot | null>;
  deleteSlotById(slotId: string): Promise<slot | null>;
  lockSlot(slotId: string, userId: string, expiresAt: Date): Promise<Lock>;
  unlockSlot(lockId: string): Promise<Lock | null>;
  isSlotLocked(slotId: string): Promise<boolean>;
  isSlotAvailable(slotId: string): Promise<boolean>;
  acquireDatabaseLock(resourceType: string, resourceId: string, lockDuration?: number): Promise<boolean>;
  releaseDatabaseLock(resourceType: string, resourceId: string): Promise<boolean>;
}