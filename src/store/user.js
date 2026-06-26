import { defineStore } from 'pinia';
import { cloud } from '@/utils/cloud';

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
    async silentLogin() {
      if (this.openid) return this.openid; // already logged in
      
      // 防止并发调用
      if (this._loginPromise) {
        return this._loginPromise;
      }

      this._loginPromise = (async () => {
        try {
          const loginRes = await new Promise((resolve, reject) => {
            uni.login({
              provider: 'weixin',
              success: resolve,
              fail: reject
            });
          });

          const { result } = await cloud.callFunction({ 
            name: 'user-center',
            data: { action: 'login', code: loginRes.code }
          });
          
          if (result.code === 0) {
            this.setOpenid(result.openid);
            this.saveToStorage();
            return result.openid;
          } else {
            console.error('Silent login failed:', result);
            const errMsg = `AppSecret可能错误(errcode: ${result.data?.errcode || '未知'})，完整信息: ${JSON.stringify(result)}`;
            uni.showModal({ title: '静默登录失败', content: errMsg, showCancel: false });
            throw new Error('静默登录失败: ' + errMsg);
          }
        } catch (err) {
          console.error('Silent login error:', err);
          const errMsg = '调用user-center云函数失败: ' + (err.message || String(err));
          uni.showModal({ title: '网络或环境异常', content: errMsg, showCancel: false });
          throw new Error(errMsg);
        } finally {
          this._loginPromise = null;
        }
      })();
      
      return this._loginPromise;
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
