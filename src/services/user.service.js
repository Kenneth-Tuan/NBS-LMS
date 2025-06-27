import userApi from "@/apis/user";
import { UserRole, UserStatus } from "../enums/appEnums";

const userService = {
  // {
  //   "paged_info": {
  //     "page": 1
  //   }
  // }
  async getUserList(pageInfo) {
    try {
      const params = {
        paged_info: {
          page: pageInfo.currentPage,
          page_size: pageInfo.pageSize,
        },
      };
      const result = await userApi.userList(params);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // {
  //   "email": "信箱",
  //   "name": "名字",
  //   "password": "密碼",
  //   "telephone": "電話。(可為空值)",
  //   "role": "身分。 可選值: ['creator','admin','manager','teacher','student']"
  // }
  async createUser(userInfo) {
    try {
      const params = {
        email: userInfo.email ?? "Guest@mail.com",
        name: userInfo.name ?? "Guest",
        password: userInfo.password ?? "Aa123456.",
        telephone: userInfo.telephone ?? "",
        role: userInfo.role ?? "student",
      };
      const result = await userApi.createUser(params);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // {
  //   "role": "身分。 可選值: ['creator','admin','manager','teacher','student']",
  //   "is_active": true
  // }
  async updateUser(userInfo) {
    try {
      const params = {
        id: userInfo.id,
        role: userInfo.role ?? UserRole.Student,
        is_active: userInfo.status === UserStatus.Active ? true : false,
      };
      const result = await userApi.updateUser(params);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export { userService };
