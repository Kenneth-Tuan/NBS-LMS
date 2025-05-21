import { defineStore, storeToRefs } from "pinia";
import { ref, reactive, computed } from "vue";

import { UserRole } from "../enums/appEnums";
import { useUserManagementStore } from "./userManagement";

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
    });

    const isLoggedIn = computed(() =>
      Object.values(UserRole).includes(userProfile.userRole)
    );
    const loginDialogOpen = ref(false);

    function getToken() {
      return $cookies.get("ApiToken");
    }

    async function fetchUserProfile(userEmail) {
      const userManagementStore = useUserManagementStore();
      const { users } = storeToRefs(userManagementStore);

      const user = users.value.find((user) => user.email === userEmail);

      if (user) {
        userProfile.userName = user.name;
        userProfile.userEmail = user.email;
        userProfile.userTel = user.telephone;
      } else {
        throw new Error("User not found");
      }
      // try {
      //   const {
      //     data: { userProfile },
      //   } = await userApi.getUserProfile();
      //   setUserProfile(userProfile);
      // } catch (error) {
      //   throw new Error("fetchUserProfile failed");
      // }
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

    function getUserAndCompanyID() {
      if (!userProfile.companyID)
        userProfile.companyID = $cookies.get("companyID").toUpperCase();
      if (!userProfile.userID)
        userProfile.userID = $cookies.get("userID").toUpperCase();
    }

    function updateLoginDialogOpen(payload) {
      loginDialogOpen.value = payload;
    }

    function logout() {
      // 移除 cookies
      $cookies.remove("ApiToken");
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
      getUserAndCompanyID,
      updateLoginDialogOpen,
      logout,
      setUserRole,
    };
  },
  {
    persist: ["userProfile"],
  }
);
