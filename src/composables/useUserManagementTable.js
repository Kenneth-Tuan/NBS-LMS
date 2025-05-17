import { computed } from "vue";
import { storeToRefs } from "pinia";
import { Modal } from "ant-design-vue";
import { useUserManagementStore } from "@/stores/userManagement";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import { getRoleText, getStatusText } from "@/utils/mappers";
import { formatLocaleDateTime } from "@/utils/formatters";

export function useUserManagementTable() {
  const store = useUserManagementStore();
  const userStore = useUserStore();

  const {
    users,
    totalUsers,
    departments,
    loading,
    exportLoading,
    pagination,
    filters,
    selectedRowKeys,
    hasSelected,
    filteredUsers,
  } = storeToRefs(store);

  const {
    updatePagination,
    applyFilters,
    resetFilters,
    updateSelectedRowKeys,
    bulkOperation,
    deleteUser,
    exportUsers,
    showEditForm,
    showCreateForm,
  } = store;

  // --- Table Columns Definition ---
  const columns = computed(() => [
    // { title: "頭像", dataIndex: "avatar", key: "avatar", width: 80 },
    // { title: "帳號", dataIndex: "username", key: "username" },
    { title: "姓名", dataIndex: "name", key: "name" },
    { title: "電子郵件", dataIndex: "email", key: "email" },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      customRender: ({ text }) => getRoleText(text),
    },
    {
      title: "電話",
      dataIndex: "telephone",
      key: "telephone",
      customRender: ({ text }) => (text ? text : "-"),
    },
    {
      title: "狀態",
      dataIndex: "status",
      key: "status",
      customRender: ({ text }) => getStatusText(text),
    },
    // {
    //   title: "最後登入",
    //   dataIndex: "lastLogin",
    //   key: "lastLogin",
    //   customRender: ({ text }) => formatLocaleDateTime(text),
    // },
    { title: "操作", key: "action", fixed: "right", width: 200 },
  ]);

  // --- Event Handlers ---
  const handlePageChange = (pagination, filters, sorter) => {
    // Log filters and sorter for debugging or future implementation
    // console.log('Table Filters:', filters);
    // console.log('Table Sorter:', sorter);

    // Update pagination state using the store action
    updatePagination(pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleExportUsers = () => {
    exportUsers();
  };

  // --- Row Selection ---
  const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys) => {
      updateSelectedRowKeys(keys);
    },
  }));

  // --- Bulk Operations Confirmation ---
  const confirmBulkOperation = (operation) => {
    const operationText =
      operation === "delete"
        ? "刪除"
        : operation === "activate"
        ? "啟用"
        : "停用";

    Modal.confirm({
      title: `確認批量${operationText}`,
      content: `確定要${operationText}所選的 ${
        selectedRowKeys.value.length
      } 個用戶嗎？${operation === "delete" ? "此操作不可撤銷。" : ""}`,
      okText: "確認",
      okType: operation === "delete" ? "danger" : "primary",
      cancelText: "取消",
      onOk: async () => {
        await bulkOperation(operation);
      },
    });
  };

  // --- Single Delete Confirmation ---
  const confirmSingleDelete = (record) => {
    Modal.confirm({
      title: "確認刪除",
      content: `確定要刪除使用者 "${record.name}" 嗎？此操作不可撤銷。`,
      okText: "確認",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deleteUser(record.id, record.name);
      },
    });
  };

  return {
    // State refs
    users,
    totalUsers,
    departments,
    loading,
    exportLoading,
    pagination,
    filters,
    selectedRowKeys,
    hasSelected,

    // Computed
    columns,
    rowSelection,
    filteredUsers,

    // Methods bound to store actions
    handlePageChange,
    handleSearch,
    handleResetFilters,
    handleExportUsers,
    showEditForm, // Expose store action directly
    showCreateForm, // Expose store action directly
    confirmBulkOperation, // Wraps store action with Modal
    confirmSingleDelete, // Wraps store action with Modal
  };
}
