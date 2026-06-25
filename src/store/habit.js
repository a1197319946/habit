import { defineStore } from 'pinia';

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
    
    // 获取当天的打卡记录
    getTodayCheckins: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.checkins.filter(c => c.date === today);
    },
    
    // 获取指定日期的打卡记录
    getCheckinsByDate: (state) => (dateStr) => {
      return state.checkins.filter(c => c.date === dateStr);
    }
  },
  actions: {
    saveToStorage() {
      uni.setStorageSync('habits', this.habits);
      uni.setStorageSync('moods', this.moods);
      uni.setStorageSync('checkins', this.checkins);
    },
    
    setHabits(newHabits) {
      this.habits = newHabits;
      this.saveToStorage();
    },
    
    addHabit(habit) {
      this.habits.push({
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      this.saveToStorage();
    },
    
    updateHabit(updatedHabit) {
      const index = this.habits.findIndex(h => h.id === updatedHabit.id);
      if (index !== -1) {
        this.habits[index] = { ...this.habits[index], ...updatedHabit };
        this.saveToStorage();
      }
    },
    
    deleteHabit(id) {
      this.habits = this.habits.filter(h => h.id !== id);
      // 同时删除该习惯的打卡和心情记录
      this.checkins = this.checkins.filter(c => c.habitId !== id);
      this.moods = this.moods.filter(m => m.habitId !== id);
      this.saveToStorage();
    },
    
    checkin(habitId, targetDate = null) {
      const today = new Date().toISOString().split('T')[0];
      const dateStr = targetDate || today;
      const existing = this.checkins.find(c => c.habitId === habitId && c.date === dateStr);
      if (!existing) {
        this.checkins.push({
          id: Date.now().toString(),
          habitId,
          date: dateStr,
          timestamp: Date.now()
        });
        this.saveToStorage();
      }
    },
    
    undoCheckin(habitId, targetDate = null) {
      const today = new Date().toISOString().split('T')[0];
      const dateStr = targetDate || today;
      this.checkins = this.checkins.filter(c => !(c.habitId === habitId && c.date === dateStr));
      this.saveToStorage();
    },
    
    addMood(moodRecord) {
      this.moods.unshift({
        ...moodRecord,
        id: Date.now().toString(),
        timestamp: Date.now()
      });
      this.saveToStorage();
    }
  }
});
