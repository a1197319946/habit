<template>
  <view class="home-container">
    <!-- Header Section -->
    <view class="header-section flex-row items-center justify-between">
      <view class="header-text flex-col">
        <text class="greeting flex-row items-center">
          坚持打卡
          <text class="sparkle">✨</text>
        </text>
        <text class="sub-greeting">自律生活，从点滴做起...</text>
      </view>
      <view class="hero-illustration">
        <view class="dynamic-calendar">
          <view class="cal-top"></view>
          <view class="cal-body">
            <text class="cal-month">{{ currentDisplayMonth }}</text>
            <text class="cal-unit">月</text>
          </view>
        </view>
        <view class="check-badge"><uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons></view>
      </view>
    </view>

    <!-- Calendar Widget -->
    <view class="calendar-widget" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <view class="calendar-inner" :style="{ transform: pageTransform, transition: pageTransition }">
        <view class="week-group" v-for="(week, wIndex) in [pastWeekDays, currentWeekDays, futureWeekDays]" :key="wIndex">
          <view 
            v-for="day in week" 
            :key="day.dateStr"
            class="calendar-day"
            @click="selectDate(day)"
          >
            <text class="day-label">{{ day.label }}</text>
            
            <view class="day-content" :class="{'is-selected-pill': day.isSelected}">
              <text class="day-number" :class="{'is-selected-text': day.isSelected && !day.isChecked, 'is-future-text': day.isFuture && !day.isToday}">{{ day.dateText }}</text>
              
              <view class="day-status-icon">
                <view v-if="day.isChecked" class="status-icon checked-circle" :class="{'today-bg': day.isToday}">
                  <uni-icons type="checkmarkempty" size="12" color="#fff"></uni-icons>
                </view>
                <view v-else class="status-icon unchecked-circle"></view>
              </view>
              
              <view v-if="day.isToday" class="active-indicator"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Habits List -->
    <view class="habits-section">
      <view class="section-header flex-row justify-between items-center">
        <view class="flex-row items-center">
          <text class="section-title">我的习惯</text>
        </view>
        <view class="manage-btn" @click="goToManage">
          <text>管理习惯</text>
          <uni-icons type="right" size="14" color="#9CA3AF"></uni-icons>
        </view>
      </view>

      <view v-if="habits.length === 0" class="empty-state flex-col items-center justify-center">
        <view class="empty-icon glass-panel flex-row items-center justify-center">
          <uni-icons type="flag" size="32" color="var(--primary)"></uni-icons>
        </view>
        <text class="empty-text">这里空空如也</text>
        <view class="action-btn secondary-btn" @click="goToAddHabit">创建第一个习惯</view>
      </view>

      <view class="habits-list" v-else>
        <view 
          v-for="habit in habits" 
          :key="habit.id" 
          class="habit-card flex-col items-center justify-center"
          :class="{ 'is-checked': isCheckedInSelectedDate(habit.id) }"
          @click="handleCheckin(habit.id)"
        >
          <view v-if="isCheckedInSelectedDate(habit.id)" class="habit-icon checked-circle">
            <uni-icons type="checkmarkempty" size="24" color="#ffffff"></uni-icons>
          </view>
          
          <view v-else class="habit-icon" :style="{ backgroundColor: habit.color || 'var(--primary-light, #E0E7FF)' }">
            <image v-if="habit.icon" :src="'/static/icons/habbit/' + habit.icon + '.png'" class="custom-icon" />
            <text v-else class="icon-text">{{ habit.name.charAt(0) }}</text>
          </view>
          
          <text class="habit-name" :class="{ 'text-checked': isCheckedInSelectedDate(habit.id) }">{{ habit.name }}</text>
          <text class="habit-time" :class="{ 'text-checked': isCheckedInSelectedDate(habit.id) }">本月已坚持 {{ getMonthlyStreak(habit.id) }}天</text>
        </view>
      </view>
    </view>
    
    <!-- Bottom Banner -->
    <view class="bottom-banner">
      <view class="banner-content">
        <text class="banner-title">每一次坚持，都是更好的自己</text>
        <text class="banner-subtitle">今天也要加油哦！<text class="emoji">💪</text></text>
      </view>
      <view class="banner-illustration">
        <text class="star-emoji">⭐</text>
      </view>
    </view>
    
    <!-- Confetti Container -->
    <view v-if="showConfetti" class="confetti-container">
      <view v-for="(p, index) in confettiParticles" :key="index" class="confetti" :style="p.style"></view>
    </view>

    <checkin-success 
      v-if="showSuccess" 
      :habit="currentHabit"
      @close="showSuccess = false" 
      @record="openMoodRecorder" 
    />

    <mood-recorder 
      v-if="showMoodRecorder"
      :habit-id="currentHabit?.id"
      :habit-name="currentHabit?.name"
      @close="showMoodRecorder = false"
      @submit="handleMoodSubmit"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import { useHabitStore } from '@/store/habit';
import { useUserStore } from '@/store/user';
import MoodRecorder from '@/components/mood-recorder/mood-recorder.vue';

const habitStore = useHabitStore();
const userStore = useUserStore();

const showSuccess = ref(false);
const showMoodRecorder = ref(false);
const showConfetti = ref(false);
const confettiParticles = ref([]);
const currentHabit = ref(null);
const pastWeekDays = ref([]);
const currentWeekDays = ref([]);

// 开启微信分享给朋友
onShareAppMessage(() => {
  return {
    title: '小习惯 - 坚持每天微小的改变',
    path: '/pages/index/index',
    // imageUrl: '/static/share-bg.jpg' // 可选：配置自定义分享卡片图片
  };
});

// 开启分享到朋友圈
onShareTimeline(() => {
  return {
    title: '小习惯 - 坚持每天微小的改变'
  };
});
const futureWeekDays = ref([]);

const { getHabits: habits } = storeToRefs(habitStore);
const _today = new Date();
const todayStr = [_today.getFullYear(), String(_today.getMonth() + 1).padStart(2, '0'), String(_today.getDate()).padStart(2, '0')].join('-');
const selectedDate = ref(todayStr);
const currentWeekOffset = ref(0);
const currentDisplayMonth = ref(new Date().getMonth() + 1);

let touchStartX = 0;
const isDragging = ref(false);
const dragOffsetX = ref(0);
const pageTransition = ref('');
const pageTransform = ref('translateX(-33.333%)');

onShow(() => {
  generateWeekDays();
});

watch(() => habitStore.checkins, () => {
  generateWeekDays();
}, { deep: true });

const generateOneWeek = (offset, returnMidMonth = false) => {
  const today = new Date();
  
  const baseDate = new Date();
  baseDate.setDate(today.getDate() + (offset * 7));
  
  const day = baseDate.getDay(); 
  const diff = day === 0 ? 6 : day - 1; 
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - diff);
  monday.setHours(0,0,0,0);

  const week = [];
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  
  let midWeekMonth = 1;
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(0,0,0,0);
    
    if (i === 3) {
      midWeekMonth = d.getMonth() + 1;
    }
    
    const isToday = d.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const isFuture = d.getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    const isSelected = dateStr === selectedDate.value;
    const hasCheckins = habitStore.getCheckins.some(c => c.date === dateStr);
    
    week.push({
      dateObj: d,
      dateStr: dateStr,
      label: labels[i],
      dateText: isToday ? '今天' : d.getDate().toString(),
      isToday: isToday,
      isFuture: isFuture,
      isSelected: isSelected,
      isChecked: hasCheckins,
    });
  }
  
  if (returnMidMonth) {
    currentDisplayMonth.value = midWeekMonth;
  }
  
  return week;
};

const generateWeekDays = () => {
  pastWeekDays.value = generateOneWeek(currentWeekOffset.value - 1);
  currentWeekDays.value = generateOneWeek(currentWeekOffset.value, true);
  futureWeekDays.value = generateOneWeek(currentWeekOffset.value + 1);
};

const selectDate = (day) => {
  if (day.isFuture && !day.isToday) {
    uni.showToast({ title: '不能选中未来的日期哦', icon: 'none' });
    return;
  }
  selectedDate.value = day.dateStr;
  generateWeekDays();
};

const onTouchStart = (e) => {
  touchStartX = e.changedTouches[0].clientX;
  isDragging.value = true;
  dragOffsetX.value = 0;
  pageTransition.value = 'none';
};

const onTouchMove = (e) => {
  if (!isDragging.value) return;
  const currentX = e.changedTouches[0].clientX;
  dragOffsetX.value = currentX - touchStartX;
  pageTransform.value = `translateX(calc(-33.333% + ${dragOffsetX.value}px))`;
};

const onTouchEnd = (e) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  const swipeThreshold = 80;
  if (dragOffsetX.value > swipeThreshold) {
    // Swipe right (past)
    pageTransition.value = 'transform 0.2s ease-out';
    pageTransform.value = `translateX(0%)`;
    setTimeout(() => {
      currentWeekOffset.value -= 1;
      generateWeekDays();
      // Move instantly back to center (which now has the new week's data)
      pageTransition.value = 'none';
      pageTransform.value = `translateX(-33.333%)`;
    }, 200);
  } else if (dragOffsetX.value < -swipeThreshold) {
    // Swipe left (future)
    pageTransition.value = 'transform 0.2s ease-out';
    pageTransform.value = `translateX(-66.666%)`;
    setTimeout(() => {
      currentWeekOffset.value += 1;
      generateWeekDays();
      // Move instantly back to center
      pageTransition.value = 'none';
      pageTransform.value = `translateX(-33.333%)`;
    }, 200);
  } else {
    // Snap back
    pageTransition.value = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    pageTransform.value = 'translateX(-33.333%)';
  }
};

const isCheckedInSelectedDate = (habitId) => {
  return habitStore.getCheckinsByDate(selectedDate.value).some(c => c.habitId === habitId);
};

const getMonthlyStreak = (habitId) => {
  const checkins = habitStore.getCheckins.filter(c => c.habitId === habitId);
  return checkins.length;
};

const triggerConfetti = () => {
  const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];
  const shapes = ['circle', 'square', 'rectangle'];
  const particles = [];
  
  for (let i = 0; i < 45; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const width = shape === 'rectangle' ? Math.random() * 8 + 6 : Math.random() * 6 + 6;
    const height = shape === 'circle' || shape === 'square' ? width : Math.random() * 4 + 4;
    const borderRadius = shape === 'circle' ? '50%' : '3px';
    
    const left = 50 + (Math.random() - 0.5) * 10;
    const tx = (Math.random() - 0.5) * 350;
    const ty = (Math.random() - 0.5) * 300 - 150; 
    const rot = Math.random() * 720;
    const delay = Math.random() * 0.1;
    
    particles.push({
      style: {
        backgroundColor: color,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: borderRadius,
        left: `${left}%`,
        top: '45%',
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        '--rot': `${rot}deg`,
        animationDelay: `${delay}s`
      }
    });
  }
  
  confettiParticles.value = particles;
  showConfetti.value = true;
  
  setTimeout(() => {
    showConfetti.value = false;
  }, 2000);
};

const handleCheckin = (habitId) => {
  const selectedObj = new Date(selectedDate.value);
  const todayObj = new Date(todayStr);
  if (selectedObj > todayObj) {
    uni.showToast({ title: '不能在未来打卡哦', icon: 'none' });
    return;
  }

  if (isCheckedInSelectedDate(habitId)) {
    uni.showModal({
      title: '提示',
      content: '确定要撤销该日的打卡吗？',
      success: (res) => {
        if (res.confirm) {
          habitStore.undoCheckin(habitId, selectedDate.value);
        }
      }
    });
  } else {
    habitStore.checkin(habitId, selectedDate.value);
    currentHabit.value = habits.value.find(h => h.id === habitId);
    
    triggerConfetti();
    
    setTimeout(() => {
      showSuccess.value = true;
    }, 1200);
  }
};

const goToAddHabit = () => {
  uni.navigateTo({
    url: '/pages/habit-create/habit-create'
  });
};

const goToManage = () => {
  uni.switchTab({
    url: '/pages/habit/habit'
  });
};

const openMoodRecorder = () => {
  showSuccess.value = false;
  showMoodRecorder.value = true;
};

const handleMoodSubmit = (moodData) => {
  habitStore.addMood(moodData);
  showMoodRecorder.value = false;
  uni.showToast({ title: '心情已记录', icon: 'success' });
};
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #F0F4FF 0%, #F8FAFC 30%, #F8FAFC 100%);
  padding: 4px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.header-section {
  padding: 4px 0 20px;
}

.header-text {
  flex: 1;
  .greeting {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 6px;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    
    .sparkle {
      font-size: 13px;
      margin-left: 2px;
    }
  }
  
  .sub-greeting {
    font-size: 14px;
    color: var(--text-light);
  }
}

.hero-illustration {
  position: relative;
  width: 72px;
  height: 72px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
  transform: rotate(4deg);
  .dynamic-calendar {
    width: 44px;
    height: 48px;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    
    .cal-top {
      height: 12px;
      background: #EF4444;
    }
    
    .cal-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F9FAFB;
      
      .cal-month {
        font-size: 22px;
        font-weight: 800;
        color: #374151;
        line-height: 1;
      }
      
      .cal-unit {
        font-size: 10px;
        color: #6B7280;
        margin-left: 2px;
        margin-top: 6px;
      }
    }
  }
  
  .check-badge {
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 28px;
    height: 28px;
    background: #8B5CF6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #F0F4FF;
    box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
  }
}

.calendar-widget {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 18px 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.calendar-inner {
  display: flex;
  width: 300%;
}

.week-group {
  width: 33.333%;
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 40px;
}

.day-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 6px;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 6px 0;
  border-radius: 20px;
  position: relative;
  transition: all 0.2s ease;
  
  &.is-selected-pill {
    background-color: #EEF2FF;
  }
}

.day-number {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  
  &.is-selected-text {
    color: #F59E0B;
  }
  
  &.is-future-text {
    color: #9CA3AF;
  }
}

.status-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checked-circle {
  background-color: #10B981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  
  &.today-bg {
    background-color: #8B5CF6;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  }
}

.unchecked-circle {
  border: 2px solid #E5E7EB;
}

.active-indicator {
  width: 16px;
  height: 3px;
  background-color: #8B5CF6;
  border-radius: 2px;
  position: absolute;
  bottom: -6px;
}

.habits-section {
  margin-top: 28px;
  margin-bottom: 16px;
  flex: 1;
}

.section-header {
  margin-bottom: 16px;
  .section-title {
    font-size: 18px;
    font-weight: 800;
    color: #111827;
  }
  .manage-btn {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #6B7280;
    background: transparent;
  }
}

.habits-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.habit-card {
  background: var(--surface, #ffffff);
  border-radius: var(--radius-lg, 16px);
  padding: 16px 8px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.05));
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid transparent;
  
  &:active {
    transform: scale(0.92);
  }
  
  &.is-checked {
    background: #ECFDF5;
    border: 1px solid rgba(16, 185, 129, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.12), 0 3px 6px rgba(16, 185, 129, 0.08);
  }

  .habit-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    color: white;
    font-size: 20px;
    font-weight: bold;
    box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
    transition: all 0.4s ease;
  }
  
  .checked-circle {
    background-color: #10B981 !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    animation: premium-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  .custom-icon {
    width: 22px;
    height: 22px;
  }
  
  .icon-text {
    font-size: 16px;
    color: white;
  }
  
  .habit-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main, #1F2937);
    margin-bottom: 2px;
    text-align: center;
  }
  
  .habit-time {
    font-size: 11px;
    color: var(--text-light, #9CA3AF);
    text-align: center;
  }
  
  .text-checked {
    color: #065F46 !important;
  }
}

.empty-state {
  margin-top: 32px;
  margin-bottom: 32px;
  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    font-size: 32px;
    margin-bottom: 24px;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }
  .empty-text {
    color: #9CA3AF;
    font-size: 15px;
    margin-bottom: 24px;
  }
}

.bottom-banner {
  background: linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
  position: relative;
  overflow: hidden;
  margin-top: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: 40px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
  }
}

.banner-content {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.banner-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  display: flex;
  align-items: center;
  
  .emoji {
    margin-left: 4px;
    font-size: 14px;
  }
}

.banner-illustration {
  z-index: 1;
  .star-emoji {
    font-size: 40px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  }
}

/* Confetti Animation Styles */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti {
  position: absolute;
  opacity: 0;
  animation: confetti-pop 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes premium-pop {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes confetti-pop {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0) rotate(0deg);
  }
  15% {
    opacity: 1;
    transform: translate(calc(var(--tx) * 0.4), calc(var(--ty) * 0.4)) scale(1.2) rotate(calc(var(--rot) * 0.2));
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), calc(var(--ty) + 250px)) scale(0.5) rotate(var(--rot));
  }
}
</style>

<style lang="scss" scoped>
.secondary-btn {
  background: #EEF2FF;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
}
</style>

