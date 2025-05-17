import authorizationApi from "@/apis/authorizationApi";
import { UserRole } from "@/enums/appEnums";
const loginService = {
  // {
  //   "email": "信箱",
  //   "password": "password"
  // }
  async login(userRole, email, password) {
    if (!Object.values(UserRole).includes(userRole)) {
      throw new Error("Invalid user role");
    }

    try {
      const { data } = await authorizationApi.login(userRole, email, password);

      const tokenPair = {
        ApiToken: data.data.token,
      };

      for (const key in tokenPair) {
        $cookies.set(key, tokenPair[key]);
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

export { loginService };
