"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotRepository = void 0;
const slotModel_1 = __importDefault(require("../Model/slotModel"));
class SlotRepository {
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
}
exports.slotRepository = new SlotRepository();
