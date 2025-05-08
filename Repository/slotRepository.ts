
import { Types } from 'mongoose';
import { slot } from '../Interfaces/slot';
import slotModel from '../Model/slotModel';
import { IslotRepository } from 'Entities/iSlotRepository';

class _slotRepository implements IslotRepository {


  async createSlot(slot: slot): Promise<slot> {
    const newSlot = new slotModel(slot);
    return newSlot.save();
  }

  async getSlotsById(id: string): Promise<slot | null> {
    return slotModel.findById(id)
  }

  async getSlotsByDoctorId(doctorId: string): Promise<slot[]> {

    const currentDate = new Date();
    const currentDay = currentDate.toISOString().split('T')[0];

    return slotModel.find({
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
    await slotModel.deleteMany({
      doctor_id: doctorId,
      status: 'available',
      day: { $lt: currentDate.toISOString().split('T')[0] }
    }).exec();
  }

  async updateSlotStatus(slotId: string, status: string): Promise<slot | null> {
    return slotModel.findByIdAndUpdate(slotId, { status: status }, { new: true }).exec()
  }

  async deleteSlotById(slotId: string): Promise<slot | null> {
    let slot = await slotModel.findByIdAndDelete(slotId).exec()
    return slot
  }
}



export default new _slotRepository();