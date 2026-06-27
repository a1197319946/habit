<template>
  <uni-popup ref="popupRef" type="bottom" :safe-area="false">
    <view class="popup-content flex-col">
      <view class="popup-header flex-row items-center justify-between">
        <text class="popup-title">打卡成功</text>
        <uni-icons type="closeempty" size="20" color="#9CA3AF" @click="close"></uni-icons>
      </view>
      
      <!-- 进度卡片 -->
      <view v-if="progressData" class="progress-card flex-col">
        <text class="progress-title">目标进展</text>
        <view class="progress-row flex-row items-center justify-between">
          <text class="stat-label">本次完成</text>
          <text class="stat-val highlight">{{ progressData.todayAmount }} {{ progressData.unit }}</text>
        </view>
        <view class="progress-row flex-row items-center justify-between">
          <text class="stat-label">{{ progressData.label }}累计</text>
          <text class="stat-val">{{ progressData.currentTotal }} {{ progressData.unit }}</text>
        </view>
        <view class="progress-row flex-row items-center justify-between">
          <text class="stat-label">{{ progressData.targetLabel }}</text>
          <text class="stat-val">{{ progressData.target }} {{ progressData.unit }}</text>
        </view>
        
        <view v-if="progressData.currentTotal >= progressData.target" class="achievement-text">
          <text>🎉 {{ progressData.targetLabel }}已达成！</text>
        </view>
      </view>
      
      <view class="actions-group flex-col">
        <view class="btn primary-btn" @click="recordMood">记心情</view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useHabitStore } from '@/store/habit';

const props = defineProps({
  habit: Object,
  date: String
});

const emit = defineEmits(['close', 'record']);
const habitStore = useHabitStore();
const popupRef = ref(null);

const open = () => {
  popupRef.value?.open();
};

const close = () => {
  popupRef.value?.close();
};

const recordMood = () => {
  emit('record');
};

defineExpose({ open, close });

const periodCheckins = computed(() => {
  if (!props.habit) return [];
  const checkins = habitStore.getCheckins.filter(c => c.habitId === props.habit.id);
  const dateStr = props.date || new Date().toISOString().split('T')[0];
  const [y, m, d] = dateStr.split('-');
  const now = new Date(y, m - 1, d);
  
  if (props.habit.frequencyType === 'weekly') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const startStr = [monday.getFullYear(), String(monday.getMonth()+1).padStart(2,'0'), String(monday.getDate()).padStart(2,'0')].join('-');
    const endStr = [sunday.getFullYear(), String(sunday.getMonth()+1).padStart(2,'0'), String(sunday.getDate()).padStart(2,'0')].join('-');
    return checkins.filter(c => c.date >= startStr && c.date <= endStr);
  } else {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = [firstDay.getFullYear(), String(firstDay.getMonth()+1).padStart(2,'0'), String(firstDay.getDate()).padStart(2,'0')].join('-');
    const endStr = [lastDay.getFullYear(), String(lastDay.getMonth()+1).padStart(2,'0'), String(lastDay.getDate()).padStart(2,'0')].join('-');
    return checkins.filter(c => c.date >= startStr && c.date <= endStr);
  }
});

const progressData = computed(() => {
  if (!props.habit) return null;
  const isAmount = props.habit.goalType === 'amount';
  
  let target = 0;
  let currentTotal = 0;
  let todayAmount = 0;
  const unit = isAmount ? (props.habit.amountUnit || '') : '次';
  const label = props.habit.frequencyType === 'weekly' ? '本周' : '本月';
  const targetLabel = props.habit.frequencyType === 'weekly' ? '周目标' : '月目标';

  if (isAmount) {
    target = Number(props.habit.amountValue) || 0;
    currentTotal = periodCheckins.value.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const todayCheckin = periodCheckins.value.find(c => c.date === props.date);
    todayAmount = todayCheckin ? (Number(todayCheckin.amount) || 0) : 0;
  } else {
    target = props.habit.frequencyType === 'weekly' ? (props.habit.weeklyTarget || 3) : (props.habit.monthlyTarget || 10);
    currentTotal = periodCheckins.value.length;
    const todayCheckin = periodCheckins.value.find(c => c.date === props.date);
    todayAmount = todayCheckin ? 1 : 0;
  }

  return { label, targetLabel, target, currentTotal, todayAmount, unit };
});
</script>

<style lang="scss" scoped>
.popup-content {
  width: 100%;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px;
}

.popup-header {
  margin-bottom: 24px;
  
  .popup-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-main);
  }
}

.progress-card {
  width: 100%;
  background: #F9FAFB;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  border: 1px solid #F3F4F6;
  
  .progress-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 12px;
  }
  
  .progress-row {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    .stat-val {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      
      &.highlight {
        color: var(--primary);
        font-size: 16px;
        font-weight: 700;
      }
    }
  }
  
  .achievement-text {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #E5E7EB;
    font-size: 14px;
    font-weight: 600;
    color: #10B981;
    text-align: center;
  }
}

.actions-group {
  width: 100%;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  width: 100%;
  height: 52px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
  }
}

.primary-btn {
  background: var(--primary);
  color: white;
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.25);
}

.secondary-btn {
  background: var(--surface);
  color: var(--text-main);
  border: 1px solid var(--border-light);
}

</style>
