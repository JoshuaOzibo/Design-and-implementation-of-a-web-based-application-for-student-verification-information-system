import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty association is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query performance with indexes
departmentSchema.index({ faculty: 1 });

const Department = mongoose.model("Department", departmentSchema);

export default Department;
export { Department };
