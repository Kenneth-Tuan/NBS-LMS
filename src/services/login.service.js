import authorizationApi from "@/apis/authorizationApi";
import { encryptString } from "@/utils/misc";
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
        $cookies.set(key, tokenPair[key], "7d");
      }

      // Encrypt email with ApiToken-derived key and store compact payload
      try {
        const encrypted = await encryptString(email, tokenPair.ApiToken);
        const payload = {
          c: encrypted.cipherTextBase64,
          i: encrypted.ivHex,
          s: encrypted.saltHex,
        };
        $cookies.set("UserEmailEnc", JSON.stringify(payload), "7d");
      } catch (e) {
        console.error("encrypt email failed", e);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },
};

export { loginService };
