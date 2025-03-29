import { ID } from "appwrite";
import { account } from "@/appwrite";
import { defineStore } from "pinia";
import dayjs from "dayjs";
import { ref, reactive, computed } from "vue";

import { UserRole } from "../enums/appEnums";
import authorizationApi from "@/apis/authorizationApi";
import userApi from "@/apis/user";

export const useUserStore = defineStore(
  "user",
  () => {
    const userProfile = reactive({
      userID: "",
      userName: "",
      userEmail: "",
      userTel: "",
      userType: 0,
      userStatus: "",
    });

    const isLoggedIn = computed(() =>
      Object.values(UserRole).includes(userProfile.userType)
    );
    const loginDialogOpen = ref(false);

    function getToken() {
      return $cookies.get("ApiToken");
    }

    async function signIn(hashedValue) {
      // 清除所有 localStorage 資料
      localStorage.clear();

      // 清除所有 sessionStorage 資料
      sessionStorage.clear();

      try {
        const { data } = await authorizationApi.signIn(hashedValue);
        const tokenPair = {
          ApiToken: data.access_token,
          RefreshToken: data.refresh_token,
          ApiTokenExpiryTime: dayjs().add(data.expires_in, "s").valueOf(),
        };

        for (const key in tokenPair) {
          $cookies.set(key, tokenPair[key]);
        }

        await fetchUserProfile();

        return !!data.access_token;
      } catch (error) {
        throw new Error("signIn failed");
      }
    }

    async function fetchUserProfile() {
      try {
        const {
          data: { userProfile },
        } = await userApi.getUserProfile();
        setUserProfile(userProfile);
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
      userProfile.userType = "";
      userProfile.userStatus = "";

      // 清除所有 localStorage 資料
      localStorage.clear();

      // 清除所有 sessionStorage 資料
      sessionStorage.clear();

      user.logout();
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
    persist: false,
  }
);

export const user = reactive({
  current: null,
  async init() {
    try {
      this.current = await account.get();
      if (!!this.current) this.setUserProfile();
    } catch (e) {
      this.current = null;
    }
  },
  async register(email, password) {
    await account.create(ID.unique(), email, password);
    await this.login(email, password);
  },
  async login(email, password) {
    await account.createEmailPasswordSession(email, password);
    this.setUserProfile();
    window.location.href = "/"; // Redirect to home page
  },
  async logout() {
    await account.deleteSession("current");
    this.current = null;
  },

  setUserProfile() {
    useUserStore().userProfile.userType = Number(this.current.prefs.userType);
    useUserStore().userProfile.userID = this.current.$id;
    useUserStore().userProfile.userName = this.current.name;
    useUserStore().userProfile.userEmail = this.current.email;
    useUserStore().userProfile.userTel = this.current.phone;
  },
});
