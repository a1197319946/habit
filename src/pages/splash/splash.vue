<template>
  <view class="splash-container flex-col items-center">
    <!-- Top Header -->
    <view class="header flex-col items-center">
      <view class="logo-row flex-row items-center justify-center">
        <view class="logo-icon flex-row items-center justify-center">
          <uni-icons type="checkbox-filled" size="28" color="#7C3AED"></uni-icons>
        </view>
        <text class="app-name">小习惯打卡</text>
      </view>
      <view class="subtitle-row flex-row items-center justify-center">
        <text class="dot">•</text>
        <text class="subtitle">每天一点点，养成好习惯</text>
        <text class="dot">•</text>
      </view>
    </view>

    <!-- Center 3D Illustration Placeholder -->
    <view class="illustration-container">
      <!-- 提示：请将裁剪好的3D插图保存为 splash-img.png 并放入对应目录 -->
      <image src="/static/images/splash-img.png" class="illustration-img" mode="aspectFit" />
    </view>

    <!-- Bottom Features & Loading -->
    <view class="bottom-section flex-col items-center">
      <!-- Features Card -->
      <view class="features-card flex-row justify-between items-center">
        <view class="feature-item flex-row items-center">
          <uni-icons type="flag" size="24" color="#8B5CF6"></uni-icons>
          <view class="feature-text flex-col">
            <text class="f-title">设定目标</text>
            <text class="f-desc">明确方向</text>
          </view>
        </view>
        <view class="feature-item flex-row items-center">
          <uni-icons type="calendar" size="24" color="#8B5CF6"></uni-icons>
          <view class="feature-text flex-col">
            <text class="f-title">每日打卡</text>
            <text class="f-desc">坚持不懈</text>
          </view>
        </view>
        <view class="feature-item flex-row items-center">
          <uni-icons type="settings" size="24" color="#8B5CF6"></uni-icons>
          <view class="feature-text flex-col">
            <text class="f-title">见证成长</text>
            <text class="f-desc">收获更好的自己</text>
          </view>
        </view>
      </view>

      <!-- Loading Info -->
      <view class="loading-area flex-col items-center">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在启动...</text>
      </view>

      <view class="footer-text flex-row items-center">
        <uni-icons type="heart-filled" size="14" color="#A78BFA"></uni-icons>
        <text class="f-text">小改变 · 大成长</text>
      </view>
    </view>
    
    <!-- Background Waves (CSS) -->
    <view class="bg-waves"></view>
  </view>
</template>

<script setup>
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { onMounted } from 'vue';

onMounted(() => {
  // 模拟2秒启动页停留
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' });
  }, 2000);
});

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
.splash-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #FAFAFF 0%, #F5EEFF 50%, #EADDFF 100%);
  position: relative;
  overflow: hidden;
  padding-top: 20vh;
}

.header {
  z-index: 10;
  margin-bottom: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo-row {
    margin-bottom: 12px;
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
      margin-right: 12px;
    }
    
    .app-name {
      font-size: 28px;
      font-weight: 800;
      color: #6D28D9;
      letter-spacing: 2px;
    }
  }
  
  .subtitle-row {
    .dot {
      color: #A78BFA;
      margin: 0 8px;
      font-size: 18px;
    }
    .subtitle {
      font-size: 15px;
      color: #8B5CF6;
      font-weight: 500;
      letter-spacing: 1px;
    }
  }
}

.illustration-container {
  width: 100%;
  height: 35vh;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .illustration-img {
    width: 90%;
    height: 100%;
  }
}

.bottom-section {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 10;
}

.features-card {
  width: 90%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 100px;
  padding: 16px 24px;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.08);
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  
  .feature-item {
    gap: 8px;
    
    .feature-text {
      .f-title {
        font-size: 13px;
        font-weight: 600;
        color: #4C1D95;
      }
      .f-desc {
        font-size: 10px;
        color: #8B5CF6;
        margin-top: 2px;
      }
    }
  }
}

.loading-area {
  margin-bottom: 24px;
  
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(124, 58, 237, 0.2);
    border-top-color: #7C3AED;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }
  
  .loading-text {
    font-size: 14px;
    color: #7C3AED;
    font-weight: 500;
  }
}

.footer-text {
  margin-bottom: 24px;
  opacity: 0.8;
  
  .f-text {
    font-size: 12px;
    color: #8B5CF6;
    margin-left: 6px;
    letter-spacing: 1px;
  }
}

.bg-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30vh;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%23D8B4FE" fill-opacity="0.3" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,208C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path><path fill="%23C084FC" fill-opacity="0.2" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
  z-index: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
