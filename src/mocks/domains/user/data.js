export const adminData = {
  userProfile: {
    userID: "A000",
    userName: "Admin",
    userEmail: "admin@test.com",
    userTel: "0912-345-678",
    userType: 1,
    userStatus: 1,
  },
};

export const managerData = {
  userProfile: {
    userID: "M000",
    userName: "Manager",
    userEmail: "manager@test.com",
    userTel: "0912-333-123",
    userType: 2,
    userStatus: 1,
  },
};

export const teacherData = {
  userProfile: {
    userID: "T000",
    userName: "Teacher",
    userEmail: "teacher@test.com",
    userTel: "0912-222-241",
    userType: 3,
    userStatus: 1,
  },
};

export const studentData = {
  userProfile: {
    userID: "S000",
    userName: "Student",
    userEmail: "student@test.com",
    userTel: "0912-111-273",
    userType: 4,
    userStatus: 1,
  },
};

// Add a list of users for user management
export const mockUsers = [
  {
    id: "A000",
    username: "admin",
    name: "系統管理員",
    email: "admin@test.com",
    phone: "0912-345-678",
    role: 1,
    status: 1,
    createdAt: "2023-10-01T08:00:00Z",
    updatedAt: "2023-10-01T08:00:00Z",
  },
  {
    id: "M000",
    username: "manager",
    name: "課程經理",
    email: "manager@test.com",
    phone: "0912-333-123",
    role: 2,
    status: 1,
    createdAt: "2023-10-02T09:30:00Z",
    updatedAt: "2023-10-02T09:30:00Z",
  },
  {
    id: "T001",
    username: "teacher1",
    name: "王老師",
    email: "teacher1@test.com",
    phone: "0912-222-001",
    role: 3,
    status: 1,
    createdAt: "2023-10-03T10:15:00Z",
    updatedAt: "2023-10-03T10:15:00Z",
  },
  {
    id: "T002",
    username: "teacher2",
    name: "李老師",
    email: "teacher2@test.com",
    phone: "0912-222-002",
    role: 3,
    status: 1,
    createdAt: "2023-10-04T11:20:00Z",
    updatedAt: "2023-10-04T11:20:00Z",
  },
  {
    id: "S001",
    username: "student1",
    name: "張同學",
    email: "student1@test.com",
    phone: "0912-111-001",
    role: 4,
    status: 1,
    createdAt: "2023-10-05T13:00:00Z",
    updatedAt: "2023-10-05T13:00:00Z",
  },
  {
    id: "S002",
    username: "student2",
    name: "林同學",
    email: "student2@test.com",
    phone: "0912-111-002",
    role: 4,
    status: 1,
    createdAt: "2023-10-06T14:30:00Z",
    updatedAt: "2023-10-06T14:30:00Z",
  },
  {
    id: "S003",
    username: "student3",
    name: "陳同學",
    email: "student3@test.com",
    phone: "0912-111-003",
    role: 4,
    status: 0, // Inactive
    createdAt: "2023-10-07T15:45:00Z",
    updatedAt: "2023-10-07T15:45:00Z",
  },
];
