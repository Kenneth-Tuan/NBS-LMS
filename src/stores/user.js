import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

import { UserRole } from "../enums/appEnums";
import userApi from "@/apis/user";
import { decryptString } from "@/utils/misc";

export const useUserStore = defineStore(
  "user",
  () => {
    const userProfile = reactive({
      userID: "",
      userName: "",
      userEmail: "",
      userTel: "",
      userRole: 0,
      userStatus: "",
      departments : [],
    });

    const isLoggedIn = computed(() => {
      const hasRole = Object.values(UserRole).includes(userProfile.userRole);
      const hasToken = typeof $cookies.get("ApiToken") === "string";
      const enc = $cookies.get("UserEmailEnc");
      const hasEncEmail =
        (typeof enc === "string" && enc.length > 0) ||
        (enc && typeof enc === "object");
      return hasRole && hasToken && hasEncEmail;
    });
    const loginDialogOpen = ref(false);

    function getToken() {
      return $cookies.get("ApiToken");
    }

    async function fetchUserProfile() {
      if (userProfile.userID && userProfile.userEmail) return;

      try {
        const 
          {data: {data}}
         = await userApi.getUserProfile();

        // Decrypt user email from cookie if present
        let decryptedEmail = "";
        try {
          const enc = $cookies.get("UserEmailEnc");
          if (enc) {
            const payload = JSON.parse(enc);
            const token = $cookies.get("ApiToken");
            if (token && payload?.c && payload?.i && payload?.s) {
              decryptedEmail = await decryptString(
                { cipherTextBase64: payload.c, ivHex: payload.i, saltHex: payload.s },
                token
              );
            }
          }
        } catch (e) {
          console.warn("Failed to decrypt user email from cookies", e);
        }

        const adaptedUserProfile = {
          userID: data.user_id,
          userName: data.user_name,
          userEmail: decryptedEmail || "",
          userTel: data.user_phone,
          userRole: data.user_role,
          userStatus: data.user_status,
          departments: data.departments,
        };

        setUserProfile(adaptedUserProfile);
      } catch (error) {
        throw new Error("fetchUserProfile failed");
      }
    }

    function setUserProfile(payload) {
      Object.keys(userProfile).forEach((key) => {
        if (payload.hasOwnProperty(key) && !!payload[key])
          userProfile[key] = payload[key];
      });
    }

    function setUserRole(newRole) {
      if (Object.values(UserRole).includes(newRole)) {
        userProfile.userRole = newRole;
        console.log(`User role manually changed to: ${newRole}`); // For debugging
      } else {
        console.warn(`Invalid user role provided: ${newRole}`);
      }
    }

    function updateLoginDialogOpen(payload) {
      loginDialogOpen.value = payload;
    }

    function logout() {
      // 移除 cookies
      $cookies.remove("ApiToken");
        $cookies.remove("UserEmailEnc");
      $cookies.remove("RefreshToken");
      $cookies.remove("ApiTokenExpiryTime");

      // 清空 userProfile
      userProfile.userID = "";
      userProfile.userName = "";
      userProfile.userEmail = "";
      userProfile.userTel = "";
      userProfile.userRole = "";
      userProfile.userStatus = "";

      // 清除所有 localStorage 資料
      localStorage.clear();

      // 清除所有 sessionStorage 資料
      sessionStorage.clear();
    }

    return {
      userProfile,
      loginDialogOpen,
      isLoggedIn,

      // methods
      getToken,

      fetchUserProfile,
      setUserProfile,
      updateLoginDialogOpen,
      logout,
      setUserRole,
    };
  },
  {
    persist: ["userProfile"],
  }
);
