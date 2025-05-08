import { review } from '../Interfaces/user';
import mongoose, { Schema, Document, Model } from 'mongoose';

const ReviewSchema: Schema<review> = new Schema({
  appointmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Appointment' 
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  }
}, {
  timestamps: true 
});


const reviewModel: Model<review> = mongoose.model<review>('Review', ReviewSchema);

export default reviewModel;