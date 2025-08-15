import { databases } from "@/appwrite";
import { message } from "ant-design-vue";

const announcementService = {
  getAnnouncements: async () => {
    try {
      const res = await databases.listDocuments(
        "67e79a70003e621495da",
        "6873421c0038833bb4d9"
      );
      return res.documents;
    } catch (error) {
      console.error(error);
    }
  },
  createAnnouncement: async (announcement) => {
    const { announcementDateTime, description, department, type } =
      announcement;
    if (!announcementDateTime || !description || !department || !type) {
      message.error("Please fill in all fields");
      return;
    }

    try {
      await databases.createDocument(
        "67e79a70003e621495da", // Database ID
        "6873421c0038833bb4d9", // Collection ID
        "unique()", // Document ID（用 "unique()" 自動產生）
        {
          announcementDateTime,
          description,
          department,
          type,
        }
      );
    } catch (error) {
      console.error(error);
    }
  },

  updateAnnouncement: async (announcement) => {
    const { announcementDateTime, description, department, type } =
      announcement;
    if (!announcementDateTime || !description || !department || !type) {
      message.error("Please fill in all fields");
      return;
    }

    try {
      await databases.updateDocument(
        "67e79a70003e621495da", // Database ID
        "6873421c0038833bb4d9", // Collection ID
        announcement.$id, // Document ID（要更新的文件 $id）
        {
          announcementDateTime,
          description,
          department,
          type,
        }
      );
    } catch (error) {
      console.error(error);
    }
  },

  deleteAnnouncement: async (announcement) => {
    try {
      await databases.deleteDocument(
        "67e79a70003e621495da",
        "6873421c0038833bb4d9",
        announcement.$id
      );
    } catch (error) {
      console.error(error);
    }
  },
};

export { announcementService };
