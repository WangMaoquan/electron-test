<script setup lang="ts">
  import { webContents } from 'electron';
  import { ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { createDialog } from '../commom/Dialog';

  let mainWindowRoutes = ref([
    {
      path: `/WindowMain/Chat`,
      isSelected: true,
      icon: `icon-chat`,
      iconSelected: `icon-chat`,
    },
    {
      path: `/WindowMain/Contact`,
      isSelected: false,
      icon: `icon-tongxunlu1`,
      iconSelected: `icon-tongxunlu`,
    },
    {
      path: `/WindowMain/Collection`,
      isSelected: false,
      icon: `icon-shoucang1`,
      iconSelected: `icon-shoucang`,
    },
  ]);
  let route = useRoute();
  const router = useRouter();
  watch(
    () => route,
    () =>
      mainWindowRoutes.value.forEach(
        (v) => (v.isSelected = v.path === route.fullPath),
      ),
    {
      immediate: true,
      deep: true,
    },
  );

  const toSetting = () => {
    router.push('/WindowSetting')
  }

  const openSettingDialog = async () => {
    const dialog = await createDialog('/WindowSetting', {
      modal: true,
      width: 800,
      fullscreenable: false,
      // backgroundColor: 'black',
      webPreferences: {
        webviewTag: false,
      },
    });
    window.addEventListener('message', (e) => {
      console.log(e.data);
    });
    dialog.postMessage({
      msgName: 'hello',
      value: 'msg from parent',
    });
  };
</script>
<template>
  <div class="BarLeft">
    <div class="userIcon">
      <img src="../assets/avatar.jpg" alt="" />
    </div>
    <div class="menu">
      <router-link
        v-for="item in mainWindowRoutes"
        :to="item.path"
        :class="[`menuItem`, { selected: item.isSelected }]"
      >
        <i
          :class="[`icon`, item.isSelected ? item.iconSelected : item.icon]"
        ></i>
      </router-link>
    </div>
    <div class="setting">
      <div class="menuItem">
        <i class="icon icon-setting" @click="openSettingDialog"></i>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .BarLeft {
    width: 54px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgb(46, 46, 46);
    -webkit-app-region: drag;
  }
  .userIcon {
    height: 84px;
    padding-top: 36px;
    box-sizing: border-box;
    img {
      width: 34px;
      height: 34px;
      margin-left: 10px;
    }
  }
  .menu {
    flex: 1;
  }
  .menuItem {
    height: 44px;
    line-height: 44px;
    text-align: center;
    padding-left: 12px;
    padding-right: 12px;
    display: block;
    text-decoration: none;
    color: rgb(126, 126, 126);
    cursor: pointer;
    -webkit-app-region: no-drag;
    i {
      font-size: 22px;
    }
    &:hover {
      color: rgb(141, 141, 141);
    }
  }
  .selected {
    color: rgb(7, 193, 96);
    &:hover {
      color: rgb(7, 193, 96);
    }
  }
  .setting {
    margin-bottom: 5px;
  }
</style>
