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
            
            // 登录成功后，从云端拉取可能保存过的用户信息
            try {
              const infoRes = await cloud.callFunction({
                name: 'user-center',
                data: { action: 'getUserInfo', openid: result.openid }
              });
              if (infoRes.result && infoRes.result.code === 0 && infoRes.result.userInfo) {
                this.setUserInfo(infoRes.result.userInfo);
              }
            } catch (err) {
              console.error('拉取云端用户信息失败', err);
            }
            
            this.saveToStorage();
            return result.openid;
          } else {
            console.error('Silent login failed:', result);
            // 同样作为静默登录，失败时不应弹窗打断用户
            return null;
          }
        } catch (err) {
          console.error('Silent login error:', err);
          const errDetail = typeof err === 'object' ? JSON.stringify(err) : String(err);
          const errMsg = '调用user-center云函数失败: ' + (err.message || errDetail);
          // 在微信单页模式（朋友圈分享等）下，uni.login 或云函数会报错，
          // 既然是静默登录，失败了直接返回即可，不要弹窗打断用户
          return null;
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
