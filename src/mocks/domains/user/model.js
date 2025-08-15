import {
  adminData,
  managerData,
  teacherData,
  studentData,
  mockUsers,
} from "@/mocks/domains/user/data";

export function generateUserprofile(token) {
  if (token === import.meta.env.VITE_ADMIN_PASSWORD_HASH) {
    return adminData;
  }

  if (token === import.meta.env.VITE_MANAGER_PASSWORD_HASH) {
    return managerData;
  }

  if (token === import.meta.env.VITE_TEACHER_PASSWORD_HASH) {
    return teacherData;
  }

  if (token === import.meta.env.VITE_STUDENT_PASSWORD_HASH) {
    return studentData;
  }

  return false;
}

// Generate mock userdata with pagination and filtering
export function getUsersWithPagination(params = {}) {
  const { page = 1, pageSize = 10, keyword, role, status } = params;

  // Clone the users array to avoid modifying the original
  let filteredUsers = [...mockUsers];

  // Apply filters
  if (keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercaseKeyword) ||
        user.username.toLowerCase().includes(lowercaseKeyword) ||
        user.email.toLowerCase().includes(lowercaseKeyword)
    );
  }

  if (role !== undefined && role !== null) {
    filteredUsers = filteredUsers.filter(
      (user) => user.role === parseInt(role)
    );
  }

  if (status !== undefined && status !== null) {
    filteredUsers = filteredUsers.filter(
      (user) => user.status === parseInt(status)
    );
  }

  // Calculate pagination
  const total = filteredUsers.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const paginatedUsers = filteredUsers.slice(start, end);

  return {
    users: paginatedUsers,
    total,
  };
}

// Get user by ID
export function getUserById(id) {
  return mockUsers.find((user) => user.id === id);
}

// Export users as CSV
export function exportUsersAsCsv() {
  const headers = [
    "ID",
    "Username",
    "Name",
    "Email",
    "Phone",
    "Role",
    "Status",
    "Created At",
    "Updated At",
    "Last Login",
    "Notes",
  ];

  const csvContent = [
    headers.join(","),
    ...mockUsers.map((user) =>
      [
        user.id,
        user.username,
        `"${user.name}"`, // Wrap in quotes to handle commas in names
        user.email,
        user.phone,
        user.role,
        user.status,
        user.createdAt,
        user.updatedAt,
        user.lastLogin || "",
        `"${user.notes || ""}"`,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
}
