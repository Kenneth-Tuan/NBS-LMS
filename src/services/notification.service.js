import { databases } from "@/appwrite";
import { AppwriteException, ID, Query } from "appwrite";

// Ensure these are configured, perhaps in a central config file or .env
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const NOTIFICATIONS_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

/**
 * Represents a notification object structure (aligns with Appwrite collection).
 * @typedef {object} Notification
 * @property {string} $id - Unique identifier.
 * @property {string} recipientId - ID of the user receiving the notification.
 * @property {string} [senderId] - ID of the user who triggered the action (optional).
 * @property {string} type - The type of notification (e.g., 'leave_request_submitted').
 * @property {string} message - The notification message.
 * @property {string} [relatedResourceId] - ID of the related resource (e.g., application ID).
 * @property {boolean} isRead - Whether the notification has been read.
 * @property {string} createdAt - ISO timestamp string of creation.
 * @property {string|null} [readAt] - ISO timestamp string when read (optional).
 * @property {string|null} [data] - JSON string containing additional context data (optional).
 */

/**
 * Represents the payload for creating a notification.
 * @typedef {object} CreateNotificationPayload
 * @property {string} recipientId
 * @property {string} [senderId]
 * @property {string} type
 * @property {string} message
 * @property {string} [relatedResourceId]
 * @property {object} [data] - Object for additional data (will be stringified).
 */

/**
 * Service class for managing notifications via Appwrite.
 */
class NotificationService {
  /**
   * Fetches notifications for a specific user.
   *
   * @param {string} userId - The ID of the user whose notifications are to be fetched.
   * @param {number} [limit=25] - Maximum number of notifications to fetch.
   * @param {number} [offset=0] - Offset for pagination.
   * @returns {Promise<Notification[]>} A promise resolving to a list of notifications.
   */
  async getNotificationsForUser(userId, limit = 25, offset = 0) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal("recipientId", userId),
          Query.orderDesc("$createdAt"), // Show newest first
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      // Assuming response.documents directly matches the Notification structure
      return response.documents;
    } catch (e) {
      const error = /** @type {AppwriteException} */ (e);
      console.error("Error fetching notifications:", error.message);
      throw error; // Re-throw for handling in the store/component
    }
  }

  /**
   * Fetches the count of unread notifications for a user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<number>} A promise resolving to the count of unread notifications.
   */
  async getUnreadNotificationCount(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal("recipientId", userId),
          Query.equal("isRead", false),
          Query.limit(1), // We only need the total count
        ]
      );
      return response.total;
    } catch (e) {
      const error = /** @type {AppwriteException} */ (e);
      console.error("Error fetching unread notification count:", error.message);
      // Decide on fallback behavior, e.g., return 0 or throw
      return 0;
    }
  }

  /**
   * Marks a specific notification as read.
   *
   * @param {string} notificationId - The ID of the notification to mark as read.
   * @returns {Promise<void>} A promise resolving when the operation is complete.
   */
  async markNotificationAsRead(notificationId) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        notificationId,
        {
          isRead: true,
          readAt: new Date().toISOString(), // Record read time
        }
      );
    } catch (e) {
      const error = /** @type {AppwriteException} */ (e);
      console.error(
        `Error marking notification ${notificationId} as read:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Marks all unread notifications for a user as read.
   *
   * @param {string} userId - The ID of the user whose notifications should be marked read.
   * @returns {Promise<void>} A promise resolving when the operation is complete.
   */
  async markAllNotificationsAsRead(userId) {
    try {
      // 1. Fetch all unread notification IDs for the user (might need pagination if many)
      let unreadIds = [];
      let offset = 0;
      const limit = 100; // Process in batches
      let response;
      do {
        response = await databases.listDocuments(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          [
            Query.equal("recipientId", userId),
            Query.equal("isRead", false),
            Query.limit(limit),
            Query.offset(offset),
            Query.select(["$id"]), // Only fetch IDs
          ]
        );
        unreadIds = unreadIds.concat(response.documents.map((doc) => doc.$id));
        offset += limit;
      } while (response.documents.length >= limit);

      if (unreadIds.length === 0) {
        console.log("No unread notifications to mark as read.");
        return;
      }

      // 2. Update each notification in parallel (or sequentially if preferred)
      const updatePromises = unreadIds.map(
        (id) => this.markNotificationAsRead(id) // Reuse single-mark method
      );

      await Promise.all(updatePromises);
      console.log(
        `Marked ${unreadIds.length} notifications as read for user ${userId}.`
      );
    } catch (e) {
      const error = /** @type {AppwriteException} */ (e);
      console.error(
        `Error marking all notifications as read for user ${userId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Creates a notification (Primarily for testing/potential future client-side creation).
   * NOTE: Usually notifications are created by backend functions.
   *
   * @param {CreateNotificationPayload} payload - The notification data.
   * @returns {Promise<Notification>} A promise resolving to the created notification.
   */
  async createNotification(payload) {
    try {
      const dataToSave = {
        ...payload,
        // Stringify data object if it exists
        data: payload.data ? JSON.stringify(payload.data) : null,
        isRead: false, // Explicitly set default
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        dataToSave
      );
      return response; // Returns the created document
    } catch (e) {
      const error = /** @type {AppwriteException} */ (e);
      console.error("Error creating notification:", error.message);
      throw error;
    }
  }
}

// Export an instance of the service
export const notificationService = new NotificationService();
