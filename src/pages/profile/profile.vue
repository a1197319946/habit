<template>
  <view class="profile-container">
    <!-- User Info Area -->
    <view class="user-header glass-panel flex-row items-center" @click="handleProfileClick">
      <view class="avatar-box">
        <image class="avatar-img" :src="userStore.userInfo.avatarUrl" mode="aspectFill" v-if="userStore.userInfo.avatarUrl" />
        <view class="avatar-placeholder flex-row items-center justify-center" v-else>
          <uni-icons type="person-filled" size="40" color="var(--primary)"></uni-icons>
        </view>
      </view>
      <view class="user-meta flex-col">
        <text class="nickname">{{ userStore.userInfo.nickName || '未授权用户' }}</text>
        <text class="sub-text">坚持打卡，遇见更好的自己</text>
      </view>
      <view class="edit-icon">›</view>
    </view>

    <!-- Function List -->
    <view class="function-list glass-panel flex-col">
      <view class="list-item flex-row items-center justify-between" @click="goTo('/pages/mood-list/mood-list')">
        <view class="item-left flex-row items-center">
          <uni-icons type="compose" size="24" color="var(--primary)" class="item-icon-ui"></uni-icons>
          <text class="item-text">心情记录</text>
        </view>
        <view class="item-arrow">›</view>
      </view>
      

      
      <view class="list-item flex-row items-center justify-between" @click="showAbout">
        <view class="item-left flex-row items-center">
          <uni-icons type="info" size="24" color="var(--primary)" class="item-icon-ui"></uni-icons>
          <text class="item-text">关于小程序</text>
        </view>
        <view class="item-arrow">›</view>
      </view>

      <button class="list-item flex-row items-center justify-between border-none menu-btn" open-type="contact">
        <view class="item-left flex-row items-center">
          <uni-icons type="staff" size="24" color="var(--primary)" class="item-icon-ui"></uni-icons>
          <text class="item-text">合作联系</text>
        </view>
        <view class="item-arrow">›</view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

onShow(() => {
  // 确保数据是最新的
  if (!userStore.isLoggedIn) {
    userStore.initFromStorage();
  }
});

const goTo = (url) => {
  uni.navigateTo({ url });
};

const handleProfileClick = () => {
  if (!userStore.userInfo.avatarUrl || !userStore.userInfo.nickName) {
    uni.navigateTo({ url: '/pages/login/login' });
  }
};

const showAbout = () => {
  uni.showModal({
    title: '关于小习惯打卡',
    content: '版本：v1.0.0\n愿你在坚持中遇见更好的自己！',
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#4F46E5'
  });
};
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  padding: 24px 20px;
  padding-bottom: 120px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.user-header {
  padding: 24px;
  margin-bottom: 24px;
  
  .avatar-box {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 16px;
    background: var(--background);
    
    .avatar-img {
      width: 100%;
      height: 100%;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: var(--primary-bg);
      .placeholder-icon {
        font-size: 32px;
        color: var(--primary);
      }
    }
  }
  
  .user-meta {
    flex: 1;
    .nickname {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }
    .sub-text {
      font-size: 13px;
      color: var(--text-muted);
    }
  }
  
  .edit-icon {
    color: var(--text-light);
    font-size: 18px;
    font-weight: bold;
  }
}

.function-list {
  padding: 8px 24px;
  
  .list-item {
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);
    
    &:active {
      opacity: 0.7;
    }
    
    &.border-none {
      border-bottom: none;
    }
    
    .item-left {
      .item-icon, :deep(.item-icon-ui) {
        margin-right: 12px;
      }
      .item-text {
        font-size: 15px;
        font-weight: 500;
        color: var(--text-main);
      }
    }
    
    .item-arrow {
      color: var(--text-light);
      font-weight: bold;
    }
  }
  
  .menu-btn {
    background: transparent;
    margin: 0;
    line-height: inherit;
    text-align: left;
    
    &::after {
      display: none;
    }
  }
}
</style>
