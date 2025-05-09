"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slotModel_1 = __importDefault(require("../Model/slotModel"));
const lockModel_1 = __importDefault(require("../Model/lockModel"));
class _slotRepository {
    async createSlot(slot) {
        const newSlot = new slotModel_1.default(slot);
        return newSlot.save();
    }
    async getSlotsById(id) {
        return slotModel_1.default.findById(id);
    }
    async getSlotsByDoctorId(doctorId) {
        const currentDate = new Date();
        const currentDay = currentDate.toISOString().split('T')[0];
        return slotModel_1.default.find({
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
    async deletePastSlots(doctorId, currentDate) {
        await slotModel_1.default.deleteMany({
            doctor_id: doctorId,
            status: 'available',
            day: { $lt: currentDate.toISOString().split('T')[0] }
        }).exec();
    }
    async updateSlotStatus(slotId, status) {
        return slotModel_1.default.findByIdAndUpdate(slotId, { status: status }, { new: true }).exec();
    }
    async deleteSlotById(slotId) {
        let slot = await slotModel_1.default.findByIdAndDelete(slotId).exec();
        return slot;
    }
    async lockSlot(slotId, userId, expiresAt) {
        // First check if the slot is available
        const slot = await this.getSlotsById(slotId);
        if (!slot || slot.status !== 'available') {
            throw new Error("Slot is not available for booking");
        }
        // Check if the slot is already locked
        const existingLock = await lockModel_1.default.findOne({
            resource_type: 'slot',
            resource_id: slotId
        });
        if (existingLock) {
            // If lock exists but is expired, we can remove it
            if (existingLock.expires_at < new Date()) {
                await lockModel_1.default.deleteOne({ _id: existingLock._id });
            }
            else if (existingLock.user_id === userId) {
                // If the same user is trying to lock again, extend the lock
                existingLock.expires_at = expiresAt;
                await existingLock.save();
                return { ...existingLock.toObject(), _id: existingLock._id };
            }
            else {
                // Another user has a valid lock
                throw new Error("This slot is temporarily reserved by another user");
            }
        }
        // Create a new lock
        const lock = new lockModel_1.default({
            resource_type: 'slot',
            resource_id: slotId,
            user_id: userId,
            expires_at: expiresAt
        });
        const savedLock = await lock.save();
        return { ...savedLock.toObject(), _id: savedLock._id };
    }
    async unlockSlot(lockId) {
        const lock = await lockModel_1.default.findByIdAndDelete(lockId);
        return lock ? { ...lock.toObject(), _id: lock._id } : null;
    }
    async isSlotLocked(slotId) {
        const lock = await lockModel_1.default.findOne({
            resource_type: 'slot',
            resource_id: slotId,
            expires_at: { $gt: new Date() }
        });
        return !!lock;
    }
    async isSlotAvailable(slotId) {
        const slot = await this.getSlotsById(slotId);
        if (!slot)
            return false;
        // Check slot status
        if (slot.status !== 'available')
            return false;
        // Check if there's an active lock
        const isLocked = await this.isSlotLocked(slotId);
        return !isLocked;
    }
    // For database-level concurrency control
    async acquireDatabaseLock(resourceType, resourceId, lockDuration = 30) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Set an expiration time for the lock (in seconds)
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + lockDuration);
            // Try to find any existing lock with this resource
            const existingLock = await lockModel_1.default.findOne({
                resource_type: `${resourceType}_db_lock`,
                resource_id: resourceId
            }).session(session);
            if (existingLock) {
                // If lock exists but is expired, remove it
                if (existingLock.expires_at < new Date()) {
                    await lockModel_1.default.deleteOne({
                        resource_type: `${resourceType}_db_lock`,
                        resource_id: resourceId
                    }).session(session);
                }
                else {
                    // Lock exists and is still valid
                    await session.abortTransaction();
                    session.endSession();
                    return false;
                }
            }
            // Create a new database lock
            await lockModel_1.default.create([{
                    resource_type: `${resourceType}_db_lock`,
                    resource_id: resourceId,
                    user_id: 'system',
                    expires_at: expiresAt
                }], { session });
            await session.commitTransaction();
            session.endSession();
            return true;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error instanceof Error && error.code === 11000) {
                // Duplicate key error means another process acquired the lock
                return false;
            }
            throw error;
        }
    }
    async releaseDatabaseLock(resourceType, resourceId) {
        const result = await lockModel_1.default.deleteOne({
            resource_type: `${resourceType}_db_lock`,
            resource_id: resourceId
        });
        return result.deletedCount > 0;
    }
}
exports.default = new _slotRepository();
