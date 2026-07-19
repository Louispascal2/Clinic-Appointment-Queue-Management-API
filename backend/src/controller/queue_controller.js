import Appointment from "../models/appointment_models.js";

export const getTodayQueue = async (req, res) => {
    try {
       const {doctorId} = req.params;
       
       const startOfDay = new Date();
       startOfDay.setHours(0, 0, 0, 0);

       const endOfDay = new Date();
       endOfDay.setHours(23, 59, 59, 999);

       const queue = await Appointment.find({
        doctor: doctorId,
        date: {$gte: startOfDay, $lt: endOfDay },
        status: {$in: ["checked in", "ongoing consultation"]}
       })
       .populate("patient", "name phone")
       .sort({priority: -1, queueNumber: 1});

       res.status(200).json(queue);
    } catch (error) {
       console.log("Error in getTodayQueue controller");
       res.status(500).json({message: "Internal server error"});
    }
}

export const checkInPatient = async (req, res) => {
   try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
        return res.status(404).json({message: "Appointmnt not found."});
    }

    if (appointment.status !== "approved" && appointment.status !== "pending") {
        return res.status(400).json({message: `Cannot check in an/a ${appointment.status} appointment`})
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const checkedInCount = await Appointment.countDocuments({
        doctor: appointment.doctor,
        date: {$gte: startOfDay, $lte: endOfDay},
        status: {$in: ["checked in", "ongoing consultation", "completed"]}
    })

    appointment.status = "checked in";
    appointment.queueNumber = checkedInCount + 1;
    await appointment.save();

    res.status(200).json({message: "Patient checked in.", appointment});
   } catch (error) {
       console.log("Error in checkInPatient controller");
       res.status(500).json({message: "Internal server error"});
   } 
}

export const callNextPatient = async (req, res) => {
   try {
      const appointment = await Appointment.findById(req.params.appointmentId);

      if (!appointment) {
        return res.status(404).json({message: "Appointment not found"});
      }
      
      if (appointment.doctor.toString() !== req.user.id.toString()) {
        return res.status(403).json({message: "Not authorized to manage this appointment."});
      }

      if (appointment.status !== "checked in") {
        return res.status(400).json({message: "Only checked patients can be called for consultation."});
      }

      appointment.status = "ongoing consultation";
      await appointment.save()

       res.status(200).json({ message: "Patient called for consultation.", appointment });
   } catch (error) {
       console.log("Error in callNextPatient controller");
       res.status(500).json({message: "Internal server error"});
   } 
}