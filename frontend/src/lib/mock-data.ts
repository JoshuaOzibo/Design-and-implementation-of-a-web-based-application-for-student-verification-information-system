export type StudentStatus = "active" | "suspended" | "graduated" | "pending";

export interface Student {
  id: string;
  matric: string;
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  session: string;
  status: StudentStatus;
  email: string;
  phone: string;
  dob: string;
  address: string;
  photo: string;
}

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export const photoFor = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1E40AF,0F766E,2563EB&fontFamily=Inter`;

void initials;

const faculties = [
  { faculty: "Engineering", department: "Computer Science" },
  { faculty: "Engineering", department: "Electrical Engineering" },
  { faculty: "Science", department: "Mathematics" },
  { faculty: "Science", department: "Physics" },
  { faculty: "Arts", department: "History" },
  { faculty: "Law", department: "Public Law" },
  { faculty: "Medicine", department: "Anatomy" },
  { faculty: "Social Sciences", department: "Economics" },
];

const names = [
  "Adaeze Okafor", "Ibrahim Musa", "Chinedu Eze", "Fatima Bello", "Tunde Adeyemi",
  "Ngozi Umeh", "Yusuf Aliyu", "Blessing Etim", "Samuel Johnson", "Halima Sani",
  "Emeka Nwosu", "Aisha Garba", "Olumide Balogun", "Chiamaka Obi", "Daniel Okoro",
  "Hauwa Mohammed", "Joshua Adewale", "Funmi Lawal", "Kelechi Anyanwu", "Zainab Idris",
  "Peter Nnamani", "Maryam Yusuf", "Victor Eze", "Grace Akpan", "Bashir Lawal",
];

const levels = ["100", "200", "300", "400", "500"];
const statuses: StudentStatus[] = ["active", "active", "active", "pending", "suspended", "graduated"];

export const students: Student[] = names.map((name, i) => {
  const fd = faculties[i % faculties.length];
  const year = 2020 + (i % 5);
  return {
    id: `STU-${1000 + i}`,
    matric: `UNI/${year}/${(1234 + i).toString().padStart(4, "0")}`,
    fullName: name,
    faculty: fd.faculty,
    department: fd.department,
    level: levels[i % levels.length],
    session: "2024/2025",
    status: statuses[i % statuses.length],
    email: name.toLowerCase().replace(/\s+/g, ".") + "@uni.edu",
    phone: "+234 80" + (10000000 + i * 137).toString().slice(0, 8),
    dob: `200${i % 6}-0${(i % 9) + 1}-1${i % 9}`,
    address: `${i + 5} Campus Road, University Town`,
    photo: photoFor(name),
  };
});

export const findStudent = (q: string) => {
  const s = q.toLowerCase().trim();
  return students.find(
    (st) => st.matric.toLowerCase() === s || st.id.toLowerCase() === s || st.fullName.toLowerCase().includes(s),
  );
};

export interface VerificationLog {
  id: string;
  date: string;
  time: string;
  staffName: string;
  type: "Matric" | "Student ID" | "QR Scan";
  studentName: string;
  matric: string;
  location: string;
  status: "verified" | "failed";
}

const staff = ["Dr. Anita Bello", "Mr. John Okeke", "Mrs. Sade Adelaja", "Prof. Hassan Bala", "Ms. Joy Eze"];
const locations = ["Main Library", "Exam Hall A", "Hostel Gate 2", "ICT Center", "Registry Office"];
const types: VerificationLog["type"][] = ["Matric", "Student ID", "QR Scan"];

export const logs: VerificationLog[] = Array.from({ length: 32 }).map((_, i) => {
  const st = students[i % students.length];
  const d = new Date(Date.now() - i * 1000 * 60 * 47);
  return {
    id: `LOG-${5000 + i}`,
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
    staffName: staff[i % staff.length],
    type: types[i % types.length],
    studentName: st.fullName,
    matric: st.matric,
    location: locations[i % locations.length],
    status: i % 9 === 0 ? "failed" : "verified",
  };
});

export const verificationTrend = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    verified: 80 + Math.round(Math.sin(i) * 30) + i * 12,
    failed: 4 + (i % 3),
  };
});

export const verificationByType = [
  { name: "Matric", value: 412 },
  { name: "Student ID", value: 268 },
  { name: "QR Scan", value: 533 },
];
