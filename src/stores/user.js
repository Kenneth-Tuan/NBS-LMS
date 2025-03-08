import { defineStore } from "pinia";
import dayjs from "dayjs";
import { ref, reactive, computed } from "vue";

import { UserRole } from "../enums/appEnums";

export const useUserStore = defineStore(
  "user",
  () => {
    const userProfile = reactive({
      role: "",
      userID: "",
      userName: "",
      userEmail: "",
      userPhone: "",
    });

    const isLoggedIn = computed(() =>
      Object.values(UserRole).includes(userProfile.role)
    );
    const loginDialogOpen = ref(false);

    function getToken() {
      return $cookies.get("ApiToken");
    }

    async function signIn() {
      const userID = import.meta.env.VITE_USER_ID;
      const companyID = import.meta.env.VITE_COMPANY_ID;

      try {
        const { data } = await authorizationApi.signIn({
          client_id: `${userID}@${companyID}`,
          client_secret: import.meta.env.VITE_CLIENT_SECRET,
        });
        const tokenPair = {
          ApiToken: data.access_token,
          RefreshToken: data.refresh_token,
          ApiTokenExpiryTime: dayjs().add(data.expires_in, "s").valueOf(),
          userID,
          companyID,
        };

        for (const key in tokenPair) {
          $cookies.set(key, tokenPair[key]);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function fetchUserProfile() {
      try {
        const params = { token: $cookies.get("ApiToken") };
        const {
          data: { objects: userProfileResponse },
        } = await ezyCargoAPI.userProfile(params);
        setUserProfile(userProfileResponse);
      } catch (error) {
        glsDialogCreateHandler({
          isCancelBtnDisplayed: false,
          title: apiErrorMessage.type.UNAVAILABLE_SERVICE,
          description: apiErrorMessage.description.GENERAL,
          okBtnLabel: apiErrorMessage.action.OK,
        });
      }
    }

    function setUserProfile(payload) {
      Object.keys(userProfile).forEach((key) => {
        if (payload.hasOwnProperty(key) && !!payload[key])
          userProfile[key] = payload[key];
      });
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
      // $cookies.remove("ApiToken");
      // $cookies.remove("RefreshToken");
      // $cookies.remove("ApiTokenExpiryTime");
      // $cookies.remove("userID");
      // $cookies.remove("companyID");

      userProfile.role = "";
      userProfile.userID = "";
      userProfile.userName = "";
      userProfile.userEmail = "";
      userProfile.userPhone = "";
    }

    return {
      userProfile,
      loginDialogOpen,
      isLoggedIn,

      // methods
      getToken,
      signIn,
      fetchUserProfile,
      setUserProfile,
      getUserAndCompanyID,
      updateLoginDialogOpen,
      logout,
    };
  },
  {
    persist: {
      paths: ["userRegion"],
    },
  }
);
