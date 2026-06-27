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
        <text class="nickname">{{ userStore.userInfo.nickName || '神秘打卡人' }}</text>
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
      
      <button class="list-item flex-row items-center justify-between menu-btn" open-type="feedback">
        <view class="item-left flex-row items-center">
          <uni-icons type="chat" size="24" color="var(--primary)" class="item-icon-ui"></uni-icons>
          <text class="item-text">建议与反馈</text>
        </view>
        <view class="item-arrow">›</view>
      </button>
      
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

    <!-- Profile Edit Popup -->
    <uni-popup ref="profilePopupRef" type="bottom" :safe-area="false">
      <view class="popup-content flex-col">
        <view class="popup-header flex-row items-center justify-between">
          <view class="date-info flex-col">
            <text class="popup-title">完善个人资料</text>
            <text class="subtitle">让大家认识你</text>
          </view>
          <uni-icons type="closeempty" size="20" color="#9CA3AF" @click="closeProfilePopup"></uni-icons>
        </view>
        
        <view class="form-body flex-col items-center w-full" style="padding-top: 16px;">
          <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-img" :src="tempAvatarUrl || '/static/tabbar/profile.png'" mode="aspectFill"></image>
            <view class="avatar-edit-badge"><uni-icons type="camera-filled" size="12" color="#fff"></uni-icons></view>
          </button>
          <text class="form-hint">点击更换头像 (可选微信头像)</text>
          
          <view class="nickname-wrapper flex-row items-center">
            <input type="nickname" class="nickname-input" placeholder="请输入或获取微信昵称" :value="tempNickName" @input="onNicknameInput" @blur="onNicknameInput" @change="onNicknameInput"/>
          </view>
        </view>
        
        <view class="footer w-full">
          <view class="submit-btn primary-btn flex-row items-center justify-center" @click="saveProfile">
            <text>保 存</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { cloud } from '@/utils/cloud';

const userStore = useUserStore();
const profilePopupRef = ref(null);
const tempAvatarUrl = ref('');
const tempNickName = ref('');

onShow(() => {
  // 确保数据是最新的
  if (!userStore.isLoggedIn) {
    userStore.initFromStorage();
  }
});


const closeProfilePopup = () => {
  profilePopupRef.value?.close();
};

const goTo = (url) => {
  uni.navigateTo({ url });
};

const handleProfileClick = () => {
  tempAvatarUrl.value = userStore.userInfo.avatarUrl || '';
  tempNickName.value = userStore.userInfo.nickName || '';
  profilePopupRef.value?.open();
};

const onChooseAvatar = (e) => {
  tempAvatarUrl.value = e.detail.avatarUrl;
};

const onNicknameInput = (e) => {
  tempNickName.value = e.detail.value;
};

const saveProfile = async () => {
  if (!tempAvatarUrl.value || !tempNickName.value) {
    uni.showToast({ title: '请完善头像和昵称', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '保存中...' });
  try {
    let fileID = tempAvatarUrl.value;
    const openid = userStore.openid;
    
    // Check if it's a WeChat temporary file that needs uploading
    const isTempFile = tempAvatarUrl.value.startsWith('wxfile://') || 
                       tempAvatarUrl.value.startsWith('http://tmp/') || 
                       tempAvatarUrl.value.startsWith('wdfile://');
                       
    if (openid && tempAvatarUrl.value && isTempFile) {
      const cloudPath = `avatars/${openid}-${Date.now()}.jpg`;
      const uploadRes = await cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempAvatarUrl.value,
      });
      fileID = uploadRes.fileID;
    }
    
    userStore.setUserInfo({
      avatarUrl: fileID,
      nickName: tempNickName.value
    });
    userStore.saveToStorage();
    
    uni.hideLoading();
    uni.showToast({ title: '保存成功', icon: 'success' });
    profilePopupRef.value?.close();
  } catch (err) {
    console.error('Save profile error', err);
    uni.hideLoading();
    let errMsg = err.message || String(err);
    if (errMsg.includes('url not in domain list')) {
      errMsg = '请在开发者工具详情中勾选“不校验合法域名”';
    }
    uni.showToast({ title: '保存失败: ' + errMsg, icon: 'none', duration: 3000 });
  }
};

const showAbout = () => {
  uni.showModal({
    title: '关于小习惯打卡',
    content: '版本：v1.0.0\n愿你在坚持中遇见更好的自己！\n\n小程序还在打磨优化，将永久免费开放使用，欢迎深度体验！后续将继续推出 ios 版本！',
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#4F46E5'
  });
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
  .subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
}

.form-body {
  margin-bottom: 24px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  background: #f3f4f6;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 2px solid white;
  
  &::after { display: none; }
  
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  
  .avatar-edit-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 24px;
    height: 24px;
    background: var(--primary);
    border-radius: 50%;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.form-hint {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 8px;
  margin-bottom: 24px;
}

.nickname-wrapper {
  width: 80%;
  background: var(--background);
  border-radius: 100px;
  padding: 12px 20px;
  
  .nickname-input {
    width: 100%;
    text-align: center;
    font-size: 16px;
    color: var(--text-main);
  }
}

.footer {
  .primary-btn {
    height: 48px;
    background: var(--primary);
    color: white;
    border-radius: var(--radius-xl);
    font-size: 16px;
    font-weight: 600;
  }
}

</style>
