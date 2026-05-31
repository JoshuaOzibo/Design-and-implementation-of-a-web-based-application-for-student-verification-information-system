import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    matricNumber: {
      type: String,
      required: [true, "Matric number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    address: {
      type: String,
      required: [true, "Home/contact address is required"],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Student photo is required"],
      default: "https://api.dicebear.com/9.x/initials/svg?seed=Student",
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty association is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department association is required"],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: {
        values: ["100", "200", "300", "400", "500"],
        message: "{VALUE} is not a valid level",
      },
    },
    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "suspended", "graduated", "pending"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
studentSchema.index({ faculty: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ status: 1 });

const Student = mongoose.model("Student", studentSchema);

export default Student;
export { Student };
