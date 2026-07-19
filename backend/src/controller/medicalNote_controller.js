import MedNote from "../models/medicalNotes.js";
import User from "../models/user_model.js";
import MailSending from "../middleware/email.js";
import Appointment from "../models/appointment_models.js";


export const createMedNote = async (req, res ) => {
    try {
     const {appointmentId, diagnosis, prescription, notes, vitals, followUpDate} = req.body;

     if (!appointmentId || !diagnosis) {
       return res.status(400).json({message: "Appointment ID and diagnosis are required."}) 
     }

     const appointment = await Appointment.findById(appointmentId);

     if (!appointment) {
        return res.status(404).json({message: "Appointment not found."});
     }

     if (appointment.doctor.toString() !== req.user.id.toString()) {
        return res.status(403).json({message: "Not authorized to add notes or report to this appointment."})
     }

     if (appointment.status !== "onging consultation") {
        return res.status(400).json({message: `Cannot add medical note to an ${appointment.status} appointment. It must be an ongoing consultation `});
     }

     const existingNote = await MedNote.findOne({appointment: appointmentId});

     if (existingNote) {
        return res.status(409).json({message: "A medical note already exist for this appointment."})
     }

     const medicalNote = await MedNote.create({
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: req.user.id,
        diagnosis,
        notes,
        vitals,
        followUpDate,
     });

     appointment.status = "completed";
     await appointment.save();

     const patientUser = await User.findById(appointment.patient);
     const doctorUser = await User.findById(req.user.id);

     const emailOptions = {
        email: patientUser.email,
        from: process.env.EMAIL,
        subject: "Your Consultation Summary - Clinic Appointment System",
        message: `Hello ${patientUser.name},\n\nYour consultation with Dr.  ${doctorUser.name} has been completed. Here is a summary:\n\nDiagnosis: ${diagnosis}\nPrescription: ${prescription || "None provided"}\n${followUpDate ? `Follow-up Date: ${new Date(followUpDate).toLocaleDateString()}\n` : ""}\nA physical hardcopy of this record has also been provided to you at the clinic — please keep both for your records.\n\nIf you have any questions about this diagnosis, please contact the clinic. `
     }

     MailSending(emailOptions).catch((error) => console.log("Failed to email patient the medical note:", error));

     res.status(201).json({ message: "Medical note created successfully.", medicalNote});
    } catch (error) {
       console.log("Error in createMedNote controller", error);
       res.status(500).json({message: "Internal server error"});
    }
}

export const getPatientHistory = async (req, res ) => {
    try {
      const {patientId} = req.params;
      const { role, id } = req.user;
      
      if (role === "patient" && patientId !== id.toString()) {
        return res.status(403).json({message: "Not authorised to view this patient's history."});
      }

      const notes = await MedNote.find({patient: patientId })
      .populate("doctor", "name specialization")
      .populate("appointment", "date department")
      .sort({ createdAt: -1 });

      res.status(200).json(notes);
    } catch (error) {
       console.log("Error in getPatientHistory controller", error);
       res.status(500).json({message: "Internal server error"});
    }
}