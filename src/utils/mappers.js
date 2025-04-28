import { UserRole } from "@/enums/appEnums";

// Role options for display and selection
export const roleOptions = [
  { label: "Admin", value: UserRole.Admin },
  { label: "管理員", value: UserRole.Manager },
  { label: "教師", value: UserRole.Teacher },
  { label: "學生", value: UserRole.Student },
];

// Status options for display and selection
export const statusOptions = [
  { label: "啟用", value: 1 },
  { label: "停用", value: 0 },
];

// Maps a role ID to its display text.
export function getRoleText(roleId) {
  const roleOption = roleOptions.find((item) => item.value === roleId);
  return roleOption ? roleOption.label : "未知";
}

// Maps a status ID to its display text.
export function getStatusText(statusId) {
  const statusOption = statusOptions.find((item) => item.value === statusId);
  return statusOption ? statusOption.label : "未知";
}
