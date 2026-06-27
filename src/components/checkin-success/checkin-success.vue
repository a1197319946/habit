<template>
  <view class="popup-mask flex-col items-center justify-center" @click="close">
    <view class="popup-content flex-col items-center" @click.stop>
      <view class="success-graphic flex-col items-center justify-center">
        <image src="/static/images/bunny_success.png" class="success-img" mode="aspectFit" />
      </view>
      <view class="title-container flex-row items-center justify-center">
        <uni-icons type="star-filled" size="22" color="#fbbf24" class="sparkle-icon"></uni-icons>
        <text class="success-title">打卡成功</text>
        <uni-icons type="star-filled" size="22" color="#fbbf24" class="sparkle-icon"></uni-icons>
      </view>
      <view class="success-desc flex-row items-center justify-center">
        <text>坚持的你，真棒！</text>
        <uni-icons type="heart-filled" size="16" color="#a855f7" class="emoji-icon"></uni-icons>
      </view>
      
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.2s ease-out;
}

.popup-content {
  background: white;
  border-radius: 36px;
  padding: 0 0 24px 0;
  width: 310px;
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.5), inset 0 0 16px rgba(255,255,255,0.8);
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.success-graphic {
  width: 100%;
  margin-bottom: 12px;
  position: relative;
  padding-top: 20px;
}

.success-img {
  width: 160px;
  height: 160px;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.success-title {
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  margin: 0 8px;
  letter-spacing: 2px;
}

.sparkle-icon {
  margin: 0 4px;
}

.success-desc {
  font-size: 15px;
  color: #4b5563;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  
  .emoji-icon {
    margin-left: 4px;
  }
}

.actions-group {
  width: 100%;
  gap: 12px;
  padding: 0 24px;
  box-sizing: border-box;
}

.btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
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
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  color: white;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.secondary-btn {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
