<script>
export default {
  onLaunch: async function () {
    console.log('App Launch');
    
    // 保留 wx.cloud.init 以支持解析以前存下来的 cloud:// 格式的头像图片
    if (typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d7g8ng9cb71699831',
        traceUser: true,
      });
    }

    // 初始化数据
    const { useUserStore } = await import('@/store/user');
    const { useHabitStore } = await import('@/store/habit');
    const userStore = useUserStore();
    const habitStore = useHabitStore();
    
    // 初始化本地的 userInfo
    await userStore.initFromStorage();
    
    // 静默登录获取 openid（如果已有，内部会直接返回）
    const openid = await userStore.silentLogin();
    
    // 使用 openid 初始化云端数据
    if (openid) {
      await habitStore.initFromCloud(openid);
    } else {
      console.error('App Launch: 获取 openid 失败，云端同步可能无法正常工作');
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/* 全局样式和 CSS 变量 */
page, ::before, ::after {
  /* 高级感调色板 - 参考高级 UI 设计规范 */
  --primary: #4F46E5; /* 靛蓝色 Indigo 600 */
  --primary-light: #818CF8; /* Indigo 400 */
  --primary-bg: #EEF2FF; /* Indigo 50 */
  
  --surface: #FFFFFF;
  --background: #F8FAFC; /* Slate 50 */
  
  --text-main: #0F172A; /* Slate 900 */
  --text-regular: #334155; /* Slate 700 */
  --text-muted: #64748B; /* Slate 500 */
  --text-light: #94A3B8; /* Slate 400 */
  
  --border-light: #F1F5F9; /* Slate 100 */
  --border-color: #E2E8F0; /* Slate 200 */
  
  --error: #EF4444; /* Red 500 */
  --success: #10B981; /* Emerald 500 */
  --warning: #F59E0B; /* Amber 500 */
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
  --shadow-float: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  
  /* 字体设置 */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

page {
  background-color: var(--background);
  color: var(--text-main);
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

view, text, image, scroll-view, button {
  box-sizing: border-box;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 常用工具类 */
.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.text-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
