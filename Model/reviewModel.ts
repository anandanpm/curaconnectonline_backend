import { Review } from '../Interfaces/user';
import mongoose, { Schema, Document, Model } from 'mongoose';

const ReviewSchema: Schema<Review> = new Schema({
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


const ReviewModel: Model<Review> = mongoose.model<Review>('Review', ReviewSchema);

export default ReviewModel;