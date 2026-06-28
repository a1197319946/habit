'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { action, code, openid, userInfo } = event;

  if (action === 'login') {
    const appid = 'wx99d45fe777f46c33';
    // TODO: 用户必须在此处填写小程序的真实 AppSecret
    const secret = '597cd788c7b49f4e53e054eed4de54d4';

    if (!code) {
      return { code: -1, msg: '缺少code参数' };
    }

    const apiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const res = await uniCloud.httpclient.request(apiUrl, {
        dataType: 'json'
      });

      if (res.data && res.data.openid) {
        return {
          code: 0,
          openid: res.data.openid
        };
      } else {
        return {
          code: -2,
          msg: '获取openid失败',
          data: res.data
        };
      }
    } catch (e) {
      return {
        code: -3,
        msg: '网络请求失败',
        error: e.message
      }
    }
  }

  // 获取云端保存的用户信息
  if (action === 'getUserInfo') {
    if (!openid) return { code: -1, msg: '缺少openid' };
    const res = await db.collection('users').where({ openid }).get();
    if (res.data && res.data.length > 0) {
      return { code: 0, userInfo: res.data[0].userInfo };
    }
    return { code: 0, userInfo: null };
  }

  // 同步保存用户信息到云端
  if (action === 'syncUserInfo') {
    if (!openid || !userInfo) return { code: -1, msg: '参数不全' };
    
    const collection = db.collection('users');
    const existing = await collection.where({ openid }).get();
    
    if (existing.data && existing.data.length > 0) {
      await collection.doc(existing.data[0]._id).update({
        userInfo,
        updateTime: Date.now()
      });
    } else {
      await collection.add({
        openid,
        userInfo,
        createTime: Date.now(),
        updateTime: Date.now()
      });
    }
    return { code: 0, msg: '同步成功' };
  }

  return { code: -1, msg: '未知操作' };
};
