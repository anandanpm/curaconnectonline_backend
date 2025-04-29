import { Types } from "mongoose";
import { Slot } from "./slot";

export interface ISlotRepository {
  createSlot(slot: Slot): Promise<Slot>;
  getSlotsById(id: string): Promise<Slot | null>;
  getSlotsByDoctorId(doctorId: string): Promise<Slot[]>;
  deletePastSlots(doctorId: string, currentDate: Date): Promise<void>;
  updateSlotStatus(slotId: string, status: string): Promise<Slot | null>;
  deleteSlotById(slotId: string): Promise<Slot | null>;
}