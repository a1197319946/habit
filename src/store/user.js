import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    openid: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.openid,
  },
  actions: {
    setUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info };
    },
    setOpenid(id) {
      this.openid = id;
    },
    async initFromStorage() {
      const stored = uni.getStorageSync('userInfo');
      if (stored) {
        try {
          const info = JSON.parse(stored);
          this.userInfo = info.userInfo || { avatarUrl: '', nickName: '' };
          this.openid = info.openid || '';
        } catch (e) {
          console.error('Parse userInfo error', e);
        }
      }
    },
    saveToStorage() {
      uni.setStorageSync('userInfo', JSON.stringify({
        userInfo: this.userInfo,
        openid: this.openid
      }));
      // 兼容旧的简单校验逻辑
      uni.setStorageSync('isLoggedIn', !!this.openid);
    }
  }
});
