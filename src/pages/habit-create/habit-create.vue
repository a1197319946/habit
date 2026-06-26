<template>
  <view class="create-container">
    <view class="form-body flex-col">
        <!-- Habit Name -->
        <view class="form-item flex-col">
          <text class="label">习惯名称 <text class="required">*</text></text>
          <input 
            class="input-box" 
            v-model="formData.name" 
            maxlength="10" 
            placeholder="例如：早起喝水" 
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
                  :class="{ 'is-active': formData.color === color }"
                  @click="formData.color = color"
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
                  :class="{ 'is-active': formData.icon === icon }"
                  :style="{ backgroundColor: formData.icon === icon ? formData.color : 'var(--background)' }"
                  @click="formData.icon = icon"
                >
                  <image :src="'/static/icons/habbit/' + icon + '.png'" class="custom-icon" />
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>

        <!-- Frequency -->
        <view class="form-item flex-col">
          <text class="label">打卡周期 <text class="required">*</text></text>
          <view class="tabs flex-row">
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': formData.cycleType === 'fixed' }"
              @click="formData.cycleType = 'fixed'"
            >固定打卡</view>
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': formData.cycleType === 'weekly' }"
              @click="formData.cycleType = 'weekly'"
            >按周打卡</view>
            <view 
              class="tab-item flex-row items-center justify-center"
              :class="{ 'is-active': formData.cycleType === 'monthly' }"
              @click="formData.cycleType = 'monthly'"
            >按月打卡</view>
          </view>
          
          <!-- Cycle Sub Options -->
          <view class="cycle-options flex-col">
            <!-- Fixed Days -->
            <view v-if="formData.cycleType === 'fixed'" class="flex-row fixed-days">
              <view 
                v-for="(day, index) in ['一','二','三','四','五','六','日']" 
                :key="index"
                class="day-circle flex-row items-center justify-center"
                :class="{ 'is-active': formData.fixedDays.includes(index + 1) }"
                @click="toggleFixedDay(index + 1)"
              >{{ day }}</view>
            </view>
            
            <!-- Weekly Days -->
            <view v-if="formData.cycleType === 'weekly'" class="flex-row items-center justify-between step-control">
              <text>每周目标天数</text>
              <view class="stepper flex-row items-center">
                <view class="step-btn" @click="formData.weeklyTarget > 1 && formData.weeklyTarget--">-</view>
                <text class="step-val">{{ formData.weeklyTarget }}</text>
                <view class="step-btn" @click="formData.weeklyTarget < 7 && formData.weeklyTarget++">+</view>
              </view>
            </view>

            <!-- Monthly Days -->
            <view v-if="formData.cycleType === 'monthly'" class="flex-row items-center justify-between step-control">
              <text>每月目标天数</text>
              <view class="stepper flex-row items-center">
                <view class="step-btn" @click="formData.monthlyTarget > 1 && formData.monthlyTarget--">-</view>
                <text class="step-val">{{ formData.monthlyTarget }}</text>
                <view class="step-btn" @click="formData.monthlyTarget < 31 && formData.monthlyTarget++">+</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    <view class="fixed-bottom">
      <view 
        class="submit-btn primary-btn flex-row items-center justify-center" 
        :class="{ 'is-loading': isSubmitting }"
        @click="submit"
      >
        <view v-if="isSubmitting" class="loading-spinner"></view>
        <text>{{ isSubmitting ? '创建中...' : '完成创建' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { reactive, computed, ref } from 'vue';
import { useHabitStore } from '@/store/habit';
import { localIcons } from '@/utils/icons';

const habitStore = useHabitStore();

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

const formData = reactive({
  name: '',
  color: allColors[0],
  icon: icons[0],
  cycleType: 'fixed',
  fixedDays: [1, 2, 3, 4, 5],
  weeklyTarget: 3,
  monthlyTarget: 10
});

const isSubmitting = ref(false);

const toggleFixedDay = (day) => {
  const idx = formData.fixedDays.indexOf(day);
  if (idx > -1) {
    if (formData.fixedDays.length > 1) {
      formData.fixedDays.splice(idx, 1);
    } else {
      uni.showToast({ title: '至少选择一天', icon: 'none' });
    }
  } else {
    formData.fixedDays.push(day);
  }
};

const submit = async () => {
  if (isSubmitting.value) return;

  const trimmedName = formData.name.trim();
  if (!trimmedName) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' });
    return;
  }
  
  // 校验重复名称
  const isDuplicate = habitStore.habits.some(h => h.name === trimmedName);
  if (isDuplicate) {
    uni.showToast({ title: '习惯已经存在了鸭 🦆', icon: 'none', duration: 2000 });
    return;
  }

  const specialChars = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
  if (specialChars.test(trimmedName)) {
    uni.showToast({ title: '习惯名称不能包含特殊字符', icon: 'none' });
    return;
  }
  
  isSubmitting.value = true;
  try {
    await habitStore.addHabit({ ...formData, name: trimmedName });
    uni.showToast({ title: '创建成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (error) {
    uni.showModal({
      title: '错误详情 (请截图)',
      content: typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error),
      showCancel: false
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 开启微信分享给朋友
onShareAppMessage(() => {
  return {
    title: '小习惯 - 坚持每天微小的改变',
    path: '/pages/index/index'
  };
});

// 开启分享到朋友圈
onShareTimeline(() => {
  return {
    title: '小习惯 - 坚持每天微小的改变'
  };
});

</script>

<style lang="scss" scoped>
.create-container {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 120px;
  background: rgba(255, 255, 255, 0.6);
}

.form-body {
  gap: 16px;
  margin-bottom: 24px;
}

.form-item {
  .label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 8px;
    .required {
      color: var(--error);
      margin-left: 4px;
    }
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
  height: 140px;
  margin-bottom: 8px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  justify-items: center;
  padding-top: 6px;
  padding-bottom: 16px;
}

.icon-swiper {
  height: 170px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  justify-items: center;
  padding-top: 6px;
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
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: all 0.2s;
  
  &.is-active {
    transform: scale(1.05);
  }
}

.custom-icon {
  width: 20px;
  height: 20px;
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

  .primary-btn {
    height: 48px;
    background: var(--primary);
    color: white;
    border-radius: var(--radius-xl);
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &.is-loading {
      opacity: 0.7;
      pointer-events: none;
    }
  }
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
