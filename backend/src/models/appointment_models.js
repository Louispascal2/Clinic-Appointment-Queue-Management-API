import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deparment"
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "checked in", "ongoing consultaion", "completed", "cancelled", "absent"],
        default: "pending"
    },
    queueNumber: {
        type: Number
    },
    priority: {
        type: String,
        enum: ["urgent", "normal"],
        default: "normal"
    },
    reason: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{timestamps: true}
)

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;