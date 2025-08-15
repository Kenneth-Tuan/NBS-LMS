import { computed, unref } from "vue";

import { UserRole, UserStatus } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

// Role options for display and selection
export const roleOptions = computed(() => {
  const { userProfile } = useUserStore();
  return [
    userProfile.userRole === UserRole.Creator && {
      label: "Creator",
      value: UserRole.Creator,
    },
    { label: "Admin", value: UserRole.Admin },
    { label: "管理員", value: UserRole.Manager },
    { label: "教師", value: UserRole.Teacher },
    { label: "學生", value: UserRole.Student },
  ].filter(Boolean);
});

// Status options for display and selection
export const statusOptions = [
  { label: "啟用", value: UserStatus.Active },
  { label: "停用", value: UserStatus.Inactive },
];

// Maps a role ID to its display text.
export function getRoleText(roleId) {
  const roleOption = unref(roleOptions).find((item) => item.value === roleId);
  return roleOption ? roleOption.label : "未知";
}

// Maps a status ID to its display text.
export function getStatusText(statusId) {
  const statusOption = statusOptions.find((item) => item.value === statusId);
  return statusOption ? statusOption.label : "未知";
}
