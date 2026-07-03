import mongoose from "mongoose";

const medNoteSchema = new mongoose.Schema({
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
        diagnosis: {
            type: String,
            required: true
        },
        prescription: {
            type: String
        },
        notes: {
            type: String
        },
        vitals:{
            bloodPressures: String,
            temperature: Number,
            weight: Number
        },
        followUpDate:{
            type: Date
        }
},
{timestamps: true}
);



const MedNote = mongoose.model("MedNote", medNoteSchema);

export default MedNote;