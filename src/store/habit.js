import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { cloud } from '@/utils/cloud';

export const useHabitStore = defineStore('habit', {
  state: () => ({
    habits: uni.getStorageSync('habits') || [],
    moods: uni.getStorageSync('moods') || [],
    checkins: uni.getStorageSync('checkins') || []
  }),
  getters: {
    getHabits: (state) => state.habits,
    getMoods: (state) => state.moods,
    getCheckins: (state) => state.checkins,
    
    getTodayCheckins: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.checkins.filter(c => c.date === today);
    },
    
    getCheckinsByDate: (state) => (dateStr) => {
      return state.checkins.filter(c => c.date === dateStr);
    }
  },
  actions: {
    getOpenId() {
      const userStore = useUserStore();
      return userStore.openid;
    },

    saveToStorage() {
      uni.setStorageSync('habits', this.habits);
      uni.setStorageSync('moods', this.moods);
      uni.setStorageSync('checkins', this.checkins);
    },

    async initFromCloud(openid) {
      if (!openid) return;
      try {
        const { result } = await cloud.callFunction({
          name: 'habit-api',
          data: { action: 'init', openid }
        });
        if (result.code === 0) {
          this.habits = [...(result.data.habits || [])];
          this.checkins = [...(result.data.checkins || [])];
          this.moods = [...(result.data.moods || [])];
          this.saveToStorage();
        }
      } catch (e) {
        console.error('initFromCloud error', e);
      }
    },
    
    setHabits(newHabits) {
      this.habits = newHabits;
      this.saveToStorage();
    },
    
    async addHabit(habit) {
      let openid = this.getOpenId();
      if (!openid) {
        // 尝试再次静默登录
        const userStore = useUserStore();
        openid = await userStore.silentLogin();
        
        if (!openid) {
          uni.showToast({ title: '无法获取登录凭证，请稍后再试', icon: 'none' });
          return Promise.reject(new Error('缺少openid'));
        }
      }
      try {
        const { result } = await cloud.callFunction({
          name: 'habit-api',
          data: { action: 'addHabit', openid, data: habit }
        });
        if (result.code === 0) {
          this.habits = [...this.habits, {
            ...habit,
            id: result.id || Date.now().toString(),
            createdAt: new Date().toISOString()
          }];
          this.saveToStorage();
        } else {
          console.error('云端保存失败', result);
          uni.showToast({ title: '云端保存失败: ' + (result.msg || result.code), icon: 'none' });
          throw new Error('保存失败');
        }
      } catch (e) {
        console.error('addHabit error', e);
        uni.showToast({ title: '保存报错: ' + (e.message || '未知错误'), icon: 'none', duration: 4000 });
        throw e;
      }
    },
    
    async updateHabit(updatedHabit) {
      const openid = this.getOpenId();
      if (!openid) return;
      
      const index = this.habits.findIndex(h => h.id === updatedHabit.id);
      if (index !== -1) {
        // Optimistic update
        this.habits[index] = { ...this.habits[index], ...updatedHabit };
        this.saveToStorage();
        
        cloud.callFunction({
          name: 'habit-api',
          data: { action: 'updateHabit', openid, data: updatedHabit }
        }).catch(e => console.error(e));
      }
    },
    
    async deleteHabit(id) {
      const openid = this.getOpenId();
      if (!openid) return;
      
      // Optimistic update
      this.habits = this.habits.filter(h => h.id !== id);
      this.checkins = this.checkins.filter(c => c.habitId !== id);
      this.moods = this.moods.filter(m => m.habitId !== id);
      this.saveToStorage();
      
      cloud.callFunction({
        name: 'habit-api',
        data: { action: 'deleteHabit', openid, data: { id } }
      }).catch(e => console.error(e));
    },
    
    async checkin(habitId, targetDate = null) {
      const openid = this.getOpenId();
      if (!openid) {
        uni.showToast({ title: '系统初始化中或未登录，请稍后再试', icon: 'none' });
        return Promise.reject(new Error('缺少openid'));
      }
      const today = new Date().toISOString().split('T')[0];
      const dateStr = targetDate || today;
      const existing = this.checkins.find(c => c.habitId === habitId && c.date === dateStr);
      
      if (!existing) {
        // Optimistic update
        const tempId = Date.now().toString();
        this.checkins = [...this.checkins, {
          id: tempId,
          habitId,
          date: dateStr,
          timestamp: Date.now()
        }];
        this.saveToStorage();
        
        try {
          const { result } = await cloud.callFunction({
            name: 'habit-api',
            data: { action: 'checkin', openid, data: { habitId, date: dateStr } }
          });
          if (result.code === 0) {
            // Update tempId with real id
            const idx = this.checkins.findIndex(c => c.id === tempId);
            if (idx !== -1) {
              this.checkins[idx].id = result.id;
              this.saveToStorage();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    
    async undoCheckin(habitId, targetDate = null) {
      const openid = this.getOpenId();
      if (!openid) return;
      const today = new Date().toISOString().split('T')[0];
      const dateStr = targetDate || today;
      
      // Optimistic
      this.checkins = this.checkins.filter(c => !(c.habitId === habitId && c.date === dateStr));
      this.saveToStorage();
      
      cloud.callFunction({
        name: 'habit-api',
        data: { action: 'undoCheckin', openid, data: { habitId, date: dateStr } }
      }).catch(e => console.error(e));
    },
    
    async addMood(moodRecord) {
      const openid = this.getOpenId();
      if (!openid) return;
      
      const tempId = Date.now().toString();
      this.moods = [{
        ...moodRecord,
        id: tempId,
        timestamp: Date.now()
      }, ...this.moods];
      this.saveToStorage();
      
      try {
        const { result } = await cloud.callFunction({
          name: 'habit-api',
          data: { action: 'addMood', openid, data: moodRecord }
        });
        if (result.code === 0) {
          const idx = this.moods.findIndex(m => m.id === tempId);
          if (idx !== -1) {
            this.moods[idx].id = result.id;
            this.saveToStorage();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
});
