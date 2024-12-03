import { createWebHistory, createRouter } from "vue-router";

import LandingPage from "@/views/LandingPage.vue";
import StepLayout from "@/layouts/StepLayout.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { StepNamesEnum } from "@/enums/StepsEnum";
import { AwbTypeEnum } from "@/enums/AppEnum";
import { i18n, updateLang } from "@/locales/index";
import { useUserStore } from "@/stores/user";
import { useMiscStore } from "@/stores/misc";

const {
  global: { availableLocales, fallbackLocale, locale },
} = i18n;

const routes = [
  {
    path: "/",
    redirect: {
      name: StepNamesEnum.LANDING_PAGE,
      params: { lang: fallbackLocale.value, awbType: AwbTypeEnum.MASTER },
    },
  },
  {
    path: "/:lang",
    children: [
      {
        path: "fwbneutralmawb",
        redirect: (to) => ({
          name: StepNamesEnum.LANDING_PAGE,
          params: {
            lang: to.params.lang || locale.value,
            awbType: AwbTypeEnum.MASTER,
          },
        }),
      },
      {
        path: "fwbneutralmawb/:awbType(master|house)",
        name: StepNamesEnum.LANDING_PAGE,
        component: LandingPage,
        meta: {
          layout: DefaultLayout,
        },
      },
      {
        path: "fwbneutralmawb/test",
        name: "test",
        component: () => import("/src/components/Test.vue"),
        meta: {
          layout: DefaultLayout,
        },
      },
      {
        path: "fwbneutralmawb/test-vuelidate",
        name: "test-vuelidate",
        component: () => import("/src/components/TestVuelidate/Index.vue"),
        meta: {
          layout: DefaultLayout,
        },
      },
      {
        path: "fwbneutralmawb/:awbType(master|house)/search",
        name: "search",
        component: () => import("/src/views/Search.vue"),
        meta: {
          layout: DefaultLayout,
        },
      },
      {
        path: "fwbneutralmawb/:awbType(master|house)/:msgID",
        meta: {
          layout: StepLayout,
        },
        children: [
          {
            path: "step1",
            name: StepNamesEnum.STEP_1,
            component: () => import("/src/views/Step1.vue"),
            meta: {
              step: 1,
            },
          },
          {
            path: "step2",
            name: StepNamesEnum.STEP_2,
            component: () => import("/src/views/Step2.vue"),
            meta: {
              step: 2,
            },
          },
          {
            path: "step3",
            name: StepNamesEnum.STEP_3,
            component: () => import("/src/views/Step3.vue"),
            meta: {
              step: 3,
            },
          },
          {
            path: "step4",
            name: StepNamesEnum.STEP_4,
            component: () => import("/src/views/Step4.vue"),
            meta: {
              step: 4,
            },
          },
          {
            path: "step5",
            name: StepNamesEnum.STEP_5,
            component: () => import("/src/views/Step5.vue"),
            meta: {
              step: 5,
            },
          },
          {
            path: "step6",
            name: StepNamesEnum.STEP_6,
            component: () => import("/src/views/Step6.vue"),
            meta: {
              step: 6,
            },
          },
        ],
      },
      {
        path: "fwbneutralmawb/:awbType(master|house)/:msgID/submission-result",
        name: "submission-result",
        component: () => import("/src/views/SubmissionResult.vue"),
        meta: {
          layout: DefaultLayout,
        },
      },
      {
        path: "fwbneutralmawb/:awbType(master|house)/:msgID/overview",
        name: "overview",
        component: () => import("/src/views/Overview.vue"),
        meta: {
          layout: StepLayout,
        },
      },
      {
        path: "fwbneutralmawb/download",
        name: "download",
        component: () => import("/src/views/Download.vue"),
        meta: {
          layout: DefaultLayout,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash)
      return {
        top: 108,
        el: to.hash,
        behavior: "smooth",
      };
    else return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const { getToken, signIn, getUserAndCompanyID } = userStore;

  const miscStore = useMiscStore();
  const { redirectToLoginPage, fetchParameters } = miscStore;

  const {
    params: { lang },
  } = to;
  const token = getToken();

  // adjust locale
  if (!availableLocales.includes(lang)) {
    console.error(
      `invalid lang in url, redirect to fallback locale:${fallbackLocale.value}`
    );
    next(`${fallbackLocale.value}/fwbneutralmawb/`);
  } else {
    updateLang(lang);
  }

  if (!token) {
    if (import.meta.env.DEV) {
      await signIn();
    } else {
      redirectToLoginPage();
      return;
    }
  }

  getUserAndCompanyID();
  fetchParameters();
  next();
});

export default router;
