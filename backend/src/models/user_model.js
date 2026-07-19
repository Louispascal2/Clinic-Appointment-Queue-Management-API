import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    email_verified:{
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "receptionist", "admin"],
      required: true,
    },
    phone: { type: String },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: Date,

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deparment",
    },
    specialization: String,
    
    consultationFee: {
      type: Number,
      min: 0,
    },
    paymentPlan:{
      type:{
        type: String,
        enum: ["none", "one-off", "monthly", "yearly"],
        default: "none"
      },
      startDate: Date,
      expiryDate: Date,
      isActive: {
        type: Boolean,
        default: false
      }
    },
    workingHours: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          required: true,
        },
        startTime: {
          type: String,
          required: true
        },
        closingTime:{
            type: String,
            required: true
        },
        isAvaliable: {
            type: Boolean,
            default: true
        }
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationToken: String,
    verificationTokenExpiresAt:{
      type:Date,
      default: null 
    }
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
