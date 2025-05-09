
import mongoose, { Types } from 'mongoose';
import { slot } from '../Interfaces/slot';
import slotModel from '../Model/slotModel';
import { IslotRepository } from '../Entities/iSlotRepository';
import lockModel from '../Model/lockModel';
import { Lock } from '../Interfaces/lock';

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

  async lockSlot(slotId: string, userId: string, expiresAt: Date): Promise<Lock> {
    // First check if the slot is available
    const slot = await this.getSlotsById(slotId);
    if (!slot || slot.status !== 'available') {
      throw new Error("Slot is not available for booking");
    }
    
    // Check if the slot is already locked
    const existingLock = await lockModel.findOne({
      resource_type: 'slot',
      resource_id: slotId
    });
    
    if (existingLock) {
      // If lock exists but is expired, we can remove it
      if (existingLock.expires_at < new Date()) {
        await lockModel.deleteOne({ _id: existingLock._id });
      } else if (existingLock.user_id === userId) {
        // If the same user is trying to lock again, extend the lock
        existingLock.expires_at = expiresAt;
        await existingLock.save();
        return { ...existingLock.toObject(), _id: existingLock._id as string | Types.ObjectId | undefined };
      } else {
        // Another user has a valid lock
        throw new Error("This slot is temporarily reserved by another user");
      }
    }
    
    // Create a new lock
    const lock = new lockModel({
      resource_type: 'slot',
      resource_id: slotId,
      user_id: userId,
      expires_at: expiresAt
    });
    
    const savedLock = await lock.save();
    return { ...savedLock.toObject(), _id: savedLock._id as string | Types.ObjectId | undefined };
  }

  async unlockSlot(lockId: string): Promise<Lock | null> {
    const lock = await lockModel.findByIdAndDelete(lockId);
    return lock ? { ...lock.toObject(), _id: lock._id as string | Types.ObjectId | undefined } : null;
  }

  async isSlotLocked(slotId: string): Promise<boolean> {
    const lock = await lockModel.findOne({
      resource_type: 'slot',
      resource_id: slotId,
      expires_at: { $gt: new Date() }
    });
    
    return !!lock;
  }

  async isSlotAvailable(slotId: string): Promise<boolean> {
    const slot = await this.getSlotsById(slotId);
    if (!slot) return false;
    
    // Check slot status
    if (slot.status !== 'available') return false;
    
    // Check if there's an active lock
    const isLocked = await this.isSlotLocked(slotId);
    return !isLocked;
  }

  // For database-level concurrency control
  async acquireDatabaseLock(resourceType: string, resourceId: string, lockDuration: number = 30): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Set an expiration time for the lock (in seconds)
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + lockDuration);

      // Try to find any existing lock with this resource
      const existingLock = await lockModel.findOne({
        resource_type: `${resourceType}_db_lock`,
        resource_id: resourceId
      }).session(session);
      
      if (existingLock) {
        // If lock exists but is expired, remove it
        if (existingLock.expires_at < new Date()) {
          await lockModel.deleteOne({ 
            resource_type: `${resourceType}_db_lock`,
            resource_id: resourceId 
          }).session(session);
        } else {
          // Lock exists and is still valid
          await session.abortTransaction();
          session.endSession();
          return false;
        }
      }
      
      // Create a new database lock
      await lockModel.create([{
        resource_type: `${resourceType}_db_lock`,
        resource_id: resourceId,
        user_id: 'system',
        expires_at: expiresAt
      }], { session });
      
      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      if (error instanceof Error && (error as any).code === 11000) {
        // Duplicate key error means another process acquired the lock
        return false;
      }
      
      throw error;
    }
  }

  async releaseDatabaseLock(resourceType: string, resourceId: string): Promise<boolean> {
    const result = await lockModel.deleteOne({
      resource_type: `${resourceType}_db_lock`,
      resource_id: resourceId
    });
    
    return result.deletedCount > 0;
  }
}



export default new _slotRepository();