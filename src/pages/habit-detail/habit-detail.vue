<template>
  <view class="detail-container">
    <view class="form-body flex-col" v-if="habit">
        <!-- Habit Name -->
        <view class="form-item flex-col">
          <text class="label">习惯名称</text>
          <input 
            class="input-box" 
            v-model="habit.name" 
            maxlength="10" 
          />
        </view>

        <!-- Icon & Color Selection -->
        <view class="form-item flex-col">
          <text class="label">选择颜色</text>
          <swiper class="color-swiper" indicator-dots indicator-color="rgba(0,0,0,0.1)" indicator-active-color="var(--primary)">
            <swiper-item v-for="(page, index) in colorPages" :key="index">
              <view class="color-grid">
                <view 
                  v-for="color in page" 
                  :key="color"
                  class="color-item"
                  :style="{ backgroundColor: color }"
                  :class="{ 'is-active': habit.color === color }"
                  @click="habit.color = color"
                ></view>
              </view>
            </swiper-item>
          </swiper>
          
          <text class="label" style="margin-top: 8px;">选择图标</text>
          <swiper class="icon-swiper" indicator-dots indicator-color="rgba(0,0,0,0.1)" indicator-active-color="var(--primary)">
            <swiper-item v-for="(page, index) in iconPages" :key="index">
              <view class="icon-grid">
                <view 
                  v-for="icon in page" 
                  :key="icon"
                  class="icon-item flex-row items-center justify-center"
                  :class="{ 'is-active': habit.icon === icon }"
                  :style="{ backgroundColor: habit.icon === icon ? habit.color : 'var(--background)' }"
                  @click="habit.icon = icon"
                >
                  <image :src="'/static/icons/habbit/' + icon + '.png'" class="custom-icon" />
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>

        <!-- Frequency -->
        <view class="form-item flex-col">
          <text class="label">打卡周期</text>
          <view class="tabs flex-row">
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': habit.cycleType === 'fixed' }"
              @click="habit.cycleType = 'fixed'"
            >固定天数</view>
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': habit.cycleType === 'weekly' }"
              @click="habit.cycleType = 'weekly'"
            >按周打卡</view>
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': habit.cycleType === 'monthly' }"
              @click="habit.cycleType = 'monthly'"
            >按月打卡</view>
          </view>
          <!-- Cycle Sub Options -->
          <view class="cycle-options flex-col">
            <!-- Fixed Days -->
            <view v-if="habit.cycleType === 'fixed'" class="flex-row fixed-days">
              <view 
                v-for="(day, index) in ['一','二','三','四','五','六','日']" 
                :key="index"
                class="day-circle flex-row items-center justify-center"
                :class="{ 'is-active': habit.fixedDays && habit.fixedDays.includes(index + 1) }"
                @click="toggleFixedDay(index + 1)"
              >{{ day }}</view>
            </view>
            
            <!-- Weekly Days -->
            <view v-if="habit.cycleType === 'weekly'" class="flex-row items-center justify-between step-control">
              <text>每周目标天数</text>
              <view class="stepper flex-row items-center">
                <view class="step-btn" @click="habit.weeklyTarget > 1 && habit.weeklyTarget--">-</view>
                <text class="step-val">{{ habit.weeklyTarget || 3 }}</text>
                <view class="step-btn" @click="habit.weeklyTarget < 7 && habit.weeklyTarget++">+</view>
              </view>
            </view>

            <!-- Monthly Days -->
            <view v-if="habit.cycleType === 'monthly'" class="flex-row items-center justify-between step-control">
              <text>每月目标天数</text>
              <view class="stepper flex-row items-center">
                <view class="step-btn" @click="habit.monthlyTarget > 1 && habit.monthlyTarget--">-</view>
                <text class="step-val">{{ habit.monthlyTarget || 10 }}</text>
                <view class="step-btn" @click="habit.monthlyTarget < 31 && habit.monthlyTarget++">+</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    <!-- Fixed Bottom Actions -->
    <view class="fixed-bottom flex-row items-center justify-between">
      <view class="save-btn-bottom flex-row items-center justify-center" @click="save">
        <text>保存</text>
      </view>
      <view style="width: 16px;"></view>
      <view class="delete-btn flex-row items-center justify-center" @click="confirmDelete">
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHabitStore } from '../../store/habit';
import { onLoad } from '@dcloudio/uni-app';
import { localIcons } from '../../utils/icons';

const habitStore = useHabitStore();
const habitId = ref('');
const habit = ref(null);

const allColors = [
  // Page 1: Reds, Pinks, Oranges
  '#B71C1C', '#FF3B30', '#F87171', '#FCA5A5', '#FFADAD', '#FFB3BA',
  '#880E4F', '#E91E63', '#FF2D55', '#FB7185', '#FFC6FF', '#FDE2E4',
  '#BF360C', '#E65100', '#FF6F00', '#F57F17', '#FF9500', '#FFDFBA',
  
  // Page 2: Yellows, Limes, Greens
  '#FFD6A5', '#FFCC00', '#FBBF24', '#FDE047', '#FFFFBA', '#FDFFB6',
  '#827717', '#CDDC39', '#8BC34A', '#E2F0CB', '#33691E', '#1B5E20',
  '#4CAF50', '#4CD964', '#34D399', '#86EFAC', '#BAFFC9', '#CAFFBF',
  
  // Page 3: Teals, Cyans, Blues
  '#004D40', '#006064', '#009688', '#B5EAD7', '#00BCD4', '#67E8F9',
  '#9BF6FF', '#5AC8FA', '#38BDF8', '#BAE1FF', '#A0C4FF', '#01579B',
  '#0D47A1', '#007AFF', '#2196F3', '#1A237E', '#3F51B5', '#818CF8',
  
  // Page 4: Indigos, Purples, Neutrals
  '#311B92', '#5856D6', '#BDB2FF', '#C7CEEA', '#4A148C', '#673AB7',
  '#9C27B0', '#A78BFA', '#E879F9', '#E6B3FF', '#3E2723', '#78716C',
  '#212121', '#94A3B8', '#9CA3AF', '#A1A1AA', '#D4D4D8', '#E5E7EB'
];

const colorPages = computed(() => {
  const pages = [];
  for (let i = 0; i < allColors.length; i += 18) {
    pages.push(allColors.slice(i, i + 18));
  }
  return pages;
});
const icons = localIcons;

const iconPages = computed(() => {
  const pages = [];
  for (let i = 0; i < icons.length; i += 18) {
    pages.push(icons.slice(i, i + 18));
  }
  return pages;
});

onLoad((options) => {
  if (options.id) {
    habitId.value = options.id;
    const existing = habitStore.getHabits.find(h => h.id === options.id);
    if (existing) {
      habit.value = JSON.parse(JSON.stringify(existing)); // deep clone
      // Ensure defaults for older records
      if (!habit.value.fixedDays) habit.value.fixedDays = [1,2,3,4,5];
      if (!habit.value.weeklyTarget) habit.value.weeklyTarget = 3;
      if (!habit.value.monthlyTarget) habit.value.monthlyTarget = 10;
    } else {
      uni.showToast({ title: '习惯不存在', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  }
});

const toggleFixedDay = (day) => {
  if (!habit.value.fixedDays) habit.value.fixedDays = [];
  const idx = habit.value.fixedDays.indexOf(day);
  if (idx > -1) {
    if (habit.value.fixedDays.length > 1) {
      habit.value.fixedDays.splice(idx, 1);
    } else {
      uni.showToast({ title: '至少选择一天', icon: 'none' });
    }
  } else {
    habit.value.fixedDays.push(day);
  }
};

const save = () => {
  if (!habit.value.name.trim()) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' });
    return;
  }
  const specialChars = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
  if (specialChars.test(habit.value.name)) {
    uni.showToast({ title: '习惯名称不能包含特殊字符', icon: 'none' });
    return;
  }
  habitStore.updateHabit(habit.value);
  uni.showToast({ title: '保存成功', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 1000);
};

const confirmDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该习惯吗？删除后所有打卡数据将无法恢复',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        habitStore.deleteHabit(habitId.value);
        uni.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 1000);
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 120px;
  background: rgba(255, 255, 255, 0.6);
}

.form-body {
  gap: 16px;
}

.form-item {
  .label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 8px;
  }
  
  .input-box {
    height: 48px;
    background: var(--background);
    border-radius: var(--radius-md);
    padding: 0 16px;
    font-size: 15px;
  }
}

.color-swiper {
  height: 130px;
  margin-bottom: 8px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  justify-items: center;
  padding-bottom: 16px;
}

.icon-swiper {
  height: 160px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  justify-items: center;
  padding-bottom: 16px;
}

.color-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: transform 0.2s;
  
  &.is-active {
    transform: scale(1.15);
    border-color: var(--text-main);
  }
}

.icon-item {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: all 0.2s;
  
  &.is-active {
    transform: scale(1.05);
  }
}

.custom-icon {
  width: 22px;
  height: 22px;
}

.tabs {
  background: var(--background);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab-item {
  flex: 1;
  height: 36px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s;
  
  &.is-active {
    background: var(--surface);
    color: var(--text-main);
    box-shadow: var(--shadow-sm);
  }
}

.cycle-options {
  margin-top: 12px;
  background: var(--background);
  border-radius: var(--radius-md);
  padding: 12px;
}

.fixed-days {
  gap: 8px;
  justify-content: space-between;
}

.day-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  
  &.is-active {
    background: var(--primary);
    color: white;
    box-shadow: var(--shadow-sm);
  }
}

.step-control {
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

.stepper {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 4px;
  
  .step-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--text-main);
    font-weight: bold;
    
    &:active {
      background: var(--border-color);
    }
  }
  
  .step-val {
    width: 36px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
  }
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-light);
  z-index: 100;
}

.save-btn-bottom {
  height: 48px;
  flex: 1;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-xl);
  font-size: 16px;
  font-weight: 600;
}

.delete-btn {
  height: 48px;
  flex: 1;
  background: #FEF2F2;
  color: var(--error);
  border: 1px solid #FECACA;
  border-radius: var(--radius-xl);
  font-size: 16px;
  font-weight: 600;
}
</style>
