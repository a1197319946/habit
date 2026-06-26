'use strict';
exports.main = async (event, context) => {
  const { action, code } = event;

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

  return { code: -1, msg: '未知操作' };
};
