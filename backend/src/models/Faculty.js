import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Faculty code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;
export { Faculty };
