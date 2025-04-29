
import { Types } from 'mongoose';
import { Slot } from '../Interfaces/slot';
import SlotModel from '../Model/slotModel';
import { ISlotRepository } from 'Interfaces/iSlotRepository';

class SlotRepository implements ISlotRepository {


  async createSlot(slot: Slot): Promise<Slot> {
    const newSlot = new SlotModel(slot);
    return newSlot.save();
  }

  async getSlotsById(id: string): Promise<Slot | null> {
    return SlotModel.findById(id)
  }

  async getSlotsByDoctorId(doctorId: string): Promise<Slot[]> {

    const currentDate = new Date();
    const currentDay = currentDate.toISOString().split('T')[0];

    return SlotModel.find({
      doctor_id: doctorId,
      status: 'available',
      $or: [

        {
          day: currentDay,
          start_time: {
            $gte: currentDate.getHours() + ':' +
              currentDate.getMinutes().toString().padStart(2, '0')
          }
        },
        { day: { $gt: currentDay } }
      ]
    }).exec();
  }

  async deletePastSlots(doctorId: string, currentDate: Date): Promise<void> {
    await SlotModel.deleteMany({
      doctor_id: doctorId,
      status: 'available',
      day: { $lt: currentDate.toISOString().split('T')[0] }
    }).exec();
  }

  async updateSlotStatus(slotId: string, status: string): Promise<Slot | null> {
    return SlotModel.findByIdAndUpdate(slotId, { status: status }, { new: true }).exec()
  }

  async deleteSlotById(slotId: string): Promise<Slot | null> {
    let slot = await SlotModel.findByIdAndDelete(slotId).exec()
    return slot
  }
}



export const slotRepository = new SlotRepository();