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
        <view class="btn secondary-btn" @click="generatePoster">生成分享海报</view>
      </view>
    </view>
  </uni-popup>
  <canvas canvas-id="posterCanvas" class="poster-canvas"></canvas>
</template>

<script setup>
import { computed, ref, getCurrentInstance } from 'vue';
import { useHabitStore } from '@/store/habit';
import { drawRoundRect } from '@/utils/canvasHelper';

const props = defineProps({
  habit: Object,
  date: String
});

const emit = defineEmits(['close', 'record']);
const habitStore = useHabitStore();
const popupRef = ref(null);
const instance = getCurrentInstance();

const open = () => {
  popupRef.value?.open();
};

const close = () => {
  popupRef.value?.close();
};

const recordMood = () => {
  emit('record');
};

// ======================== STATS LOGIC ========================
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

const statsData = computed(() => {
  if (!props.habit) return null;
  const checkins = habitStore.getCheckins.filter(c => c.habitId === props.habit.id).sort((a,b) => a.date.localeCompare(b.date));
  
  const totalCount = checkins.length;
  
  const dateStr = props.date || new Date().toISOString().split('T')[0];
  const [ty, tm, td] = dateStr.split('-');
  const todayDate = new Date(ty, tm - 1, td);
  const currentMonthStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0');
  const thisMonthCheckins = checkins.filter(c => c.date.startsWith(currentMonthStr));
  const monthCount = thisMonthCheckins.length;
  const monthDays = new Set(thisMonthCheckins.map(c => c.date)).size;
  
  let maxStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let lastDate = null;
  const uniqueDates = Array.from(new Set(checkins.map(c => c.date))).sort();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const d1 = new Date(lastDate);
      const d2 = new Date(uniqueDates[i]);
      const diff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak += 1;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
    lastDate = uniqueDates[i];
  }
  
  const todayStr = dateStr;
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterdayStr = [yesterdayDate.getFullYear(), String(yesterdayDate.getMonth() + 1).padStart(2, '0'), String(yesterdayDate.getDate()).padStart(2, '0')].join('-');
  
  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    currentStreak = 0;
  } else {
    let backDate = new Date(uniqueDates.includes(todayStr) ? todayStr : yesterdayStr);
    while (true) {
      const bStr = [backDate.getFullYear(), String(backDate.getMonth() + 1).padStart(2, '0'), String(backDate.getDate()).padStart(2, '0')].join('-');
      if (uniqueDates.includes(bStr)) {
        currentStreak++;
        backDate.setDate(backDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  const dayOfWeek = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;
  const mondayDate = new Date(todayDate);
  mondayDate.setDate(todayDate.getDate() - dayOfWeek);
  
  const weeklyTrend = [];
  let weekCheckins = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    const hasCheckin = uniqueDates.includes(dStr);
    if (hasCheckin) weekCheckins++;
    weeklyTrend.push(hasCheckin);
  }
  
  return { totalCount, monthCount, monthDays, maxStreak, currentStreak, weeklyTrend, weekCheckins };
});

// ======================== POSTER GENERATION ========================
const generatePoster = () => {
  try {
    uni.showLoading({ title: '生成中...' });
    const ctx = uni.createCanvasContext('posterCanvas', instance.proxy);
    const W = 375;
    const H = 667;
    ctx.scale(0.5, 0.5);
    
    // 1. Immersive Gradient
    const bgGrd = ctx.createLinearGradient(0, 0, 0, 1334);
    bgGrd.addColorStop(0, '#E2CBFF'); 
    bgGrd.addColorStop(0.45, '#F2E6FF'); 
    bgGrd.addColorStop(1, '#FFFFFF'); 
    ctx.setFillStyle(bgGrd);
    ctx.fillRect(0, 0, 750, 1334);
    
    // 2. Rabbit Background at Bottom (Correct Aspect Ratio 750x257)
    ctx.drawImage('/static/images/header_bg.png', 0, 1334 - 257, 750, 257);
    
    // 3. Top Custom Text Logo (Dynamic spacing to prevent overlap)
    const topY = 120;
    ctx.setTextAlign('left');
    ctx.setFontSize(60);
    const tickW = ctx.measureText('Tick').width || 120;
    const ayW = ctx.measureText('ay').width || 60;
    const dotSpacing = 50; 
    const totalLogoW = tickW + ayW + dotSpacing;
    const startX = (750 - totalLogoW) / 2;
    
    // Tick
    ctx.setFillStyle('#111827');
    ctx.fillText('Tick', startX, topY);
    
    // Purple dot icon
    const dotX = startX + tickW + (dotSpacing / 2);
    ctx.beginPath();
    ctx.arc(dotX, topY - 18, 18, 0, 2*Math.PI);
    ctx.setFillStyle('#8B5CF6');
    ctx.fill();
    // White checkmark
    ctx.beginPath();
    ctx.moveTo(dotX - 8, topY - 18);
    ctx.lineTo(dotX - 2, topY - 12);
    ctx.lineTo(dotX + 8, topY - 26);
    ctx.setStrokeStyle('#FFFFFF');
    ctx.setLineWidth(4);
    ctx.stroke();
    
    // ay
    ctx.setFillStyle('#8B5CF6');
    ctx.fillText('ay', startX + tickW + dotSpacing, topY);
    
    // Tagline
    ctx.setFontSize(26);
    ctx.setFillStyle('#6B7280');
    ctx.setTextAlign('center');
    ctx.fillText('小习惯，大成就', 375, topY + 60);
    
    // 4. Middle Clean White Card
    const cY = 380;
    ctx.setShadow(0, 20, 50, 'rgba(139,92,246,0.15)');
    ctx.setFillStyle('#FFFFFF');
    drawRoundRect(ctx, 40, cY, 670, 640, 40);
    ctx.fill();
    ctx.setShadow(0, 0, 0, 'rgba(0,0,0,0)');
    
    // 4.5 Habit Icon Image
    if (props.habit?.icon) {
      ctx.drawImage(`/static/icons/habbit/${props.habit.icon}.png`, 325, cY + 50, 100, 100);
    }
    
    // 5. Motivational Quote
    ctx.setFontSize(40);
    ctx.setFillStyle('#111827');
    ctx.setTextAlign('center');
    ctx.fillText('每一次小小的坚持，', 375, cY + 220);
    ctx.fillText('都是在塑造更好的自己。', 375, cY + 290);
    
    // 6. "今天是坚持习惯的第X天"
    const hName = props.habit?.name || '未知习惯';
    ctx.setFontSize(28);
    ctx.setFillStyle('#6B7280');
    ctx.fillText(`今天是坚持「${hName}」的第`, 375, cY + 390);
    
    ctx.setFontSize(110);
    ctx.setFillStyle('#8B5CF6');
    ctx.fillText(statsData.value.totalCount, 375, cY + 520);
    
    ctx.setFontSize(26);
    ctx.setFillStyle('#9CA3AF');
    ctx.fillText('天', 375, cY + 590);
    ctx.setTextAlign('left');
    
    // 7. QR Code in bottom right corner of the card
    ctx.drawImage('/static/scancode.jpg', 540, cY + 440, 140, 140);
    ctx.setFontSize(20);
    ctx.setFillStyle('#9CA3AF');
    ctx.fillText('扫码一起打卡', 545, cY + 610);
    
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          fileType: 'png',
          destWidth: 750,
          destHeight: 1334,
          success: (res) => {
            uni.hideLoading();
            uni.previewImage({ urls: [res.tempFilePath], current: res.tempFilePath });
          },
          fail: (err) => {
            console.error('canvas to file failed', err);
            uni.hideLoading();
            uni.showToast({ title: '海报生成失败', icon: 'none' });
          }
        }, instance.proxy);
      }, 500);
    });
  } catch (err) {
    uni.hideLoading();
    uni.showModal({ title: "Error", content: err.message || String(err) });
    console.error(err);
  }
};

defineExpose({ open, close });
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

.poster-canvas {
  width: 375px;
  height: 667px;
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
