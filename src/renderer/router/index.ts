import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/WindowMain" },
  {
    path: "/WindowMain",
    component: () => import("window/Main.vue"),
    children: [
      { path: "Chat", component: () => import("window/main/Chat.vue") },
      { path: "Contact", component: () => import("window/main/Contact.vue") },
      { path: "Collection", component: () => import("window/main/Collection.vue") },
    ],
  },
  {
    path: "/WindowSetting",
    component: () => import("window/Setting.vue"),
    children: [{ path: "AccountSetting", component: () => import("window/setting/AccountSetting.vue") }],
  },
  {
    path: "/WindowUserInfo",
    component: () => import("window/UserInfo.vue"),
  },
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

export default router;