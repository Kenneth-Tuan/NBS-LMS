import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import { notificationService } from "@/services/notification.service"; // Assumes .js resolution
import { useAuthStore } from "@/stores/auth.store"; // Assumes .js file

export const useNotificationStore = defineStore("notifications", () => {
  // Dependencies
  const authStore = useAuthStore();

  // State
  /** @type {import('vue').Ref<Array<import('@/services/notification.service').Notification>>} */
  const notifications = ref([]);
  /** @type {import('vue').Ref<number>} */
  const unreadCount = ref(0);
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false);
  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null);
  /** @type {import('vue').Ref<boolean>} */
  const hasFetchedInitial = ref(false); // Track initial fetch

  // Getters
  const currentUserId = computed(() => authStore.user?.$id);

  // Actions
  /**
   * Fetches the initial count of unread notifications.
   * @returns {Promise<void>}
   */
  async function fetchUnreadCount() {
    if (!currentUserId.value) {
      // console.debug('fetchUnreadCount: No user ID, skipping fetch.');
      return;
    }
    try {
      // console.debug(`fetchUnreadCount: Fetching for user ${currentUserId.value}`);
      unreadCount.value = await notificationService.getUnreadNotificationCount(
        currentUserId.value
      );
      // console.debug(`fetchUnreadCount: Fetched count: ${unreadCount.value}`);
      error.value = null;
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
      error.value = "無法獲取未讀通知數量";
    }
  }

  /**
   * Fetches the list of notifications for the current user.
   * @param {number} [limit=25] - Max number of notifications to fetch.
   * @returns {Promise<void>}
   */
  async function fetchNotifications(limit = 25) {
    if (!currentUserId.value) {
      // console.debug('fetchNotifications: No user ID, skipping fetch.');
      return;
    }
    if (isLoading.value) {
      // console.debug('fetchNotifications: Already loading, skipping fetch.');
      return; // Prevent concurrent fetches
    }

    // console.debug(`fetchNotifications: Fetching for user ${currentUserId.value}`);
    isLoading.value = true;
    error.value = null;
    try {
      notifications.value = await notificationService.getNotificationsForUser(
        currentUserId.value,
        limit
      );
      // console.debug(`fetchNotifications: Fetched ${notifications.value.length} notifications.`);
      // Recalculate unread count directly from the fetched list for consistency
      unreadCount.value = notifications.value.filter((n) => !n.isRead).length;
      hasFetchedInitial.value = true;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      error.value = "無法加載通知列表。";
      notifications.value = []; // Clear list on error
      unreadCount.value = 0; // Reset count on error
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Marks a specific notification as read and updates the state.
   * @param {string} notificationId - The ID of the notification to mark as read.
   * @returns {Promise<void>}
   */
  async function markAsRead(notificationId) {
    const notificationIndex = notifications.value.findIndex(
      (n) => n.$id === notificationId
    );
    if (
      notificationIndex === -1 ||
      notifications.value[notificationIndex].isRead
    ) {
      // console.debug(`markAsRead: Notification ${notificationId} not found or already read.`);
      return; // Already marked or not found
    }

    // Optimistic update
    // console.debug(`markAsRead: Optimistically marking ${notificationId} as read.`);
    const wasUnread = !notifications.value[notificationIndex].isRead;
    notifications.value[notificationIndex].isRead = true;
    if (wasUnread && unreadCount.value > 0) {
      unreadCount.value--;
    }

    try {
      await notificationService.markNotificationAsRead(notificationId);
      // If successful, state is already updated optimistically
    } catch (err) {
      console.error(
        `Failed to mark notification ${notificationId} as read:`,
        err
      );
      error.value = "標記已讀失敗，請稍後重試。";
      // Revert optimistic update on failure
      // console.debug(`markAsRead: Reverting optimistic update for ${notificationId}.`);
      notifications.value[notificationIndex].isRead = false;
      if (wasUnread) {
        unreadCount.value++;
      }
    }
  }

  /**
   * Marks all notifications as read for the current user.
   * @returns {Promise<void>}
   */
  async function markAllAsRead() {
    if (!currentUserId.value || unreadCount.value === 0) {
      // console.debug('markAllAsRead: No user or no unread notifications.');
      return;
    }

    // console.debug('markAllAsRead: Optimistically marking all as read.');
    const originalNotifications = JSON.parse(
      JSON.stringify(notifications.value)
    );
    const originalUnreadCount = unreadCount.value;

    // Optimistic update
    notifications.value = notifications.value.map((n) => ({
      ...n,
      isRead: true,
    }));
    unreadCount.value = 0;
    error.value = null;

    try {
      await notificationService.markAllNotificationsAsRead(currentUserId.value);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      error.value = "全部標記已讀失敗，請稍後重試。";
      // Revert optimistic update
      // console.debug('markAllAsRead: Reverting optimistic update.');
      notifications.value = originalNotifications;
      unreadCount.value = originalUnreadCount;
    }
  }

  /**
   * Clears all local notification state.
   * @returns {void}
   */
  function resetNotificationState() {
    // console.debug('resetNotificationState: Clearing local state.');
    notifications.value = [];
    unreadCount.value = 0;
    isLoading.value = false;
    error.value = null;
    hasFetchedInitial.value = false;
  }

  // Watchers
  watch(
    currentUserId,
    (newUserId, oldUserId) => {
      if (newUserId) {
        // console.debug(`Watcher: User changed to ${newUserId}. Fetching initial data.`);
        fetchUnreadCount();
        if (!hasFetchedInitial.value) {
          fetchNotifications();
        }
      } else if (oldUserId && !newUserId) {
        // User logged out
        // console.debug('Watcher: User logged out. Resetting state.');
        resetNotificationState();
      }
    },
    { immediate: true }
  );

  // TODO: Implement Realtime updates using Appwrite Realtime

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasFetchedInitial,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    resetNotificationState,
  };
});
