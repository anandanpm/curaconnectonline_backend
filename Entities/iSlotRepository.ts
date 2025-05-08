import { Types } from "mongoose";
import { slot } from "../Interfaces/slot";

export interface IslotRepository {
  createSlot(slot: slot): Promise<slot>;
  getSlotsById(id: string): Promise<slot | null>;
  getSlotsByDoctorId(doctorId: string): Promise<slot[]>;
  deletePastSlots(doctorId: string, currentDate: Date): Promise<void>;
  updateSlotStatus(slotId: string, status: string): Promise<slot | null>;
  deleteSlotById(slotId: string): Promise<slot | null>;
}