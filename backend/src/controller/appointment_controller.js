import User from "../models/user_model.js";
import Appointment from "../models/appointment_models.js";
import MailSending from "../middleware/email.js";
import dotenv from "dotenv";

dotenv.config();

export const createAppointment = async (req, res) => {
    try {
      const {role, id} = req.user;
      const {doctor, department, date, reason, patient}  = req.body;
      
      if (!doctor || !department || !date) {
        return res.status(400).json({message: "doctor, department, and date are required."})
      }

      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({message: "Inalid date format,. use ISO format: YYYY-MM-DDTHH:mm:ss.sssZ"});
      }

      let patientId;
      if (role === "patient") {
        patientId = id
      }else if (role === "receptionist" || role === "admin") {
        if (!patient) {
            return res.status(400).json({message: "Patient ID is required when booking on behalf of someone."})
        }
        patientId = patient;
      }else{
        return res.status(403).json({message: "Not authorized to book appointments."});
      }

      const realDoctor = await User.findById(doctor);
      if (!realDoctor || realDoctor.role !== "doctor") {
        return res.status(400).json({message: "This doctor is not a valid user."});
      }

      const realPatient = await User.findById(patientId);
      if (!realPatient || realPatient.role !== "patient") {
        return res.status(400).json({message: "This patient is not a valid user."})
      }

      const hasActivePlan = realPatient.paymentPlan?.isActive && realPatient.paymentPlan?.expiryDate && realPatient.paymentPlan.expiryDate > new Date();

      let paymentType; 
      let amountPaid;
      

      if (hasActivePlan) {
        paymentType = realPatient.paymentPlan.type;
        amountPaid = 0;

        if (realPatient.paymentPlan.type === "one-off") {
        realPatient.paymentPlan.isActive = false;
        await realPatient.save();
         }
      }else{
        paymentType = "pay-per-visit";
        amountPaid = realDoctor.consultationFee || 0;
        
      }

      const appointment = await Appointment.create({
        patient: patientId,
        doctor,
        department,
        date: new Date(date),
        reason,
        status: "pending",
        createdBy: id,
        paymentType,
        amountPaid,
      })

   

      const appointmentDate = new Date(date).toLocaleString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: "true"
      });

      const emailOptions = {
        email: realPatient.email,
        from: process.env.EMAIL,
        subject: "Clinical Appointment Confirmation",
        message: `Hello ${realPatient.name}, \n\nYour appointment has been booked successfully.\n\nAppointment Details:
        \n\nDoctor: Dr. ${realDoctor.name} 
        \nDate: ${appointmentDate}
        \nReason: ${reason || "Not specified"}
        \nPayment: ${paymentType === "pay-per-visit" ? `₦${amountPaid} (paid per visit)` :`Covered by your ${paymentType} plan`}\n\n Your appointment status is currently pending, upon approval you will be notified.\n\nIf you did not book this appointment, please contact the clinic immediately.`,
      }

      MailSending(emailOptions).catch((error) => console.log("Failed to email the patient about appointment:", error))

      res.status(201).json({ message: "Appointment booked successfully.", appointment });
    } catch (error) {
     console.log("Error in createAppointment controller", error);
     res.status(500).json({message: "Internal server error"});   
    }
}

export const getAllAppointments = async (req, res) => {
   try {
    const {role, id} = req.user;
    let filter = {};

    if (role === "patient") {
        filter = {patient: id}
    }else if (role === "doctor") {
        filter = {doctor: id}
    }

    const appointments = await Appointment.find(filter)
    .populate("patient", "name phone")
    .populate("doctor", "name specialization")
    .populate("department", "name")
    .sort({date: -1})

    res.status(200).json(appointments)
   } catch (error) {
        console.log("Error in getAppointments controller:", error);
    res.status(500).json({ message: "Internal server error" });
   } 
}

export const getAppointmentById = async (req, res) => {
    try {
     const appointment = await Appointment.findById(req.params.id)
     .populate("patient", "name phone")
     .populate("doctor", "name specialization") 
     .populate("department", "name") 
     
     if (!appointment) {
        res.status(404).json({message: "Appointment not found"});
     }

     const {role, id} = req.user;

     if (role === "patient" && appointment.patient._id.toString() !== id.toString()) {
        return res.status(403).json({message: "Not authorised to view this appointment."})
     }

    if (role === "doctor" && appointment.doctor._id.toString() !== id.toString()) {
        return res.status(403).json({message: "Not authorised to view this appointment."})
     }

     res.status(200).json(appointment);
    } catch (error) {
        console.log("Error in getAppointmentById controller", error);
        res.status(500).json({message: "Internal server error"})
    }
}

export const updateAppointmentStatus = async (req, res) => {
   try {
    const {status} = req.body;
    const validStatus = ["pending", "approved", "cancelled", "absent"]

    if (!validStatus.includes(status)) {
        return res.status(400).json({message: `Status must be one of: ${validStatus.join(",")} `});
    }
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, {status}, {new: true, runValidators: true});

    if (!appointment) {
        return res.status(404).json({message: "Appointment status not found"});
    }

    res.status(200).json({message: "Appointment status updated successfully:", appointment})
   } catch (error) {
    console.log("Error in updateAppointmentStatus controller:", error);
    res.status(500).json({ message: "Internal server error" });
   } 
}

export const cancelAppointment = async (req, res ) => {
   try {
    const {role, id} = req.user;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({message: "Appointment not found"}); 
    }

    if (role === "patient" && appointment.patient.toString() !== id.toString()) {
        return res.status(403).josn({message: "Not authorised to cancel this appointment."})
    }

    appointment.status = "cancelled";
    await appointment.save()

    res.status(200).json({message: "Appoitment cancelled.", appointment});

   } catch (error) {
    console.log("Error in cancelAppointment controller", error);
    res.status(500).json({message: "Internal server error"});
   } 
}