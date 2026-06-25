<template>
  <view class="popup-mask flex-col items-center justify-center" @click="close">
    <view class="popup-content flex-col items-center" @click.stop>
      <view class="success-graphic flex-col items-center justify-center">
        <image src="/static/icons/other/打卡成功.svg" class="success-img" />
      </view>
      <text class="success-title">打卡成功</text>
      <text class="success-desc">坚持的你，真棒！</text>
      
      <view class="actions-group flex-col">
        <view class="btn primary-btn" @click="recordMood">记心情</view>
        <view class="btn secondary-btn" @click="close">关闭</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['close', 'record']);

const close = () => {
  emit('close');
};

const recordMood = () => {
  emit('record');
};
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--uni-bg-color-mask, rgba(0, 0, 0, 0.4));
  z-index: 999;
  animation: fadeIn 0.2s ease-out;
}

.popup-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  width: 280px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-graphic {
  margin-bottom: 24px;
}

.success-img {
  width: 80px;
  height: 80px;
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.success-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.actions-group {
  width: 100%;
  gap: 12px;
}

.btn {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

.primary-btn {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.secondary-btn {
  background: var(--background);
  color: var(--text-regular);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
