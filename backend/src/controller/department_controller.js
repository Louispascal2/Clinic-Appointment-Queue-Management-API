import User from "../models/user_model.js";
import Department from "../models/departments_model.js";


export const createDepartment = async (req, res) => {
  try {
    const {name, description, head} = req.body;

    if (!name) {
     return res.status(400).json({message: "Department name is required"});
    }

    const existing = await Department.findOne({name});

    if (existing) {
      return res.status(409).json({message: "Department already exists."});
    }

    if (head) {
      const user = await User.findById(head);
      if (!user || user.role !== "doctor") {
       return res.status(400).json({message: "Head must be a valid doctor's user ID."});
      }
    }

    const department = await Department.create({name, description, head});
    res.status(201).json({message: "Department created successfully.", department})
  } catch (error) {
    console.log("Error in create department controller:", error);
    res.status(500).json({message: "Internal server error"})
  }
}

export const getAllDept = async (req, res) => {
  try {
    const depts = await Department.find().populate("head", "name specialization");
    res.status(200).json(depts);
  } catch (error) {
    console.log("Error in get all dept controller", error);
    res.status(500).json({message: "Internal server error"})
  }
}

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id).populate("head", "name specialization");

    if (!dept) {
      return res.status(404).json({message: "Department not found"});
    }

    res.status(200).json(dept);
  } catch (error) {
    console.log("Error in get dept by id controller", error);
    res.status(500).json({message: "Internal server error"})
  }
}

export const updateDept = async (req, res) => {
  try {
    const {name, description, head} = req.body;

    if (head) {
      const user = await User.findById(head);
      if (!user || user.role !== "doctor") {
        return res.status(400).json({message: "Head must be a valid doctor's userId"});
      }
    }

    const dept = await Department.findByIdAndDelete(req.params.id, {name, description, head}, {new: true, runValidators: true}).populate("head", "name specialization");

    if (!dept) {
      return res.status(404).json({message: "Department not found"});
    }

    res.status(200).json({message: "Department updated successfully", dept})
  } catch (error) {
    console.log("Error in get all dept controller", error);
    res.status(500).json({message: "Internal server error"})
  }
}

export const deleteDept = async (req, res) => {
  try {
   const dept = await Department.findByIdAndDelete(req.params.id);
   
   if (!dept) {
    return res.status(404).json({message: "Department not found."})
   }

   res.status(200).json({message: "Department deleted successfully."});
   
  } catch (error) {
    console.log("Error in delete department controller", error);
    res.status(500).json({message: "Internal server error"});
  }
}