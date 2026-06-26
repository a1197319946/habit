'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { action, openid, data } = event;
  
  if (!openid) {
    return { code: -1, msg: '缺少openid，无法验证身份' };
  }
  
  const habitsCol = db.collection('habits');
  const checkinsCol = db.collection('checkins');
  const moodsCol = db.collection('moods');
  
  switch (action) {
    case 'init': {
      // 获取用户所有的习惯、打卡、心情 (加上 catch 防止集合不存在时报错)
      const habits = await habitsCol.where({ openid }).get().catch(() => ({ data: [] }));
      const checkins = await checkinsCol.where({ openid }).get().catch(() => ({ data: [] }));
      const moods = await moodsCol.where({ openid }).get().catch(() => ({ data: [] }));
      
      return {
        code: 0,
        data: {
          // 由于云数据库的主键是 _id，为了前端使用方便，可以将 _id 映射为 id
          habits: habits.data.map(item => ({ ...item, id: item._id })),
          checkins: checkins.data.map(item => ({ ...item, id: item._id })),
          moods: moods.data.map(item => ({ ...item, id: item._id }))
        }
      };
    }
    
    case 'addHabit': {
      const res = await habitsCol.add({
        ...data,
        openid,
        createdAt: new Date().toISOString()
      });
      return { code: 0, id: res.id };
    }
    
    case 'updateHabit': {
      const { id, ...updateData } = data;
      delete updateData._id;
      delete updateData.openid;
      
      // 安全修复：必须同时匹配 id 和当前用户的 openid，防止越权修改他人数据
      await habitsCol.where({ _id: id, openid }).update(updateData);
      return { code: 0 };
    }
    
    case 'deleteHabit': {
      const { id } = data;
      // 安全修复：必须同时匹配 id 和当前用户的 openid，防止越权删除他人数据
      const deleteRes = await habitsCol.where({ _id: id, openid }).remove();
      
      if (deleteRes.deleted > 0) {
        // 只有在成功删除了属于自己的习惯后，才级联删除相关的打卡和心情记录
        await checkinsCol.where({ habitId: id, openid }).remove();
        await moodsCol.where({ habitId: id, openid }).remove();
      }
      return { code: 0 };
    }
    
    case 'checkin': {
      const { habitId, date } = data;
      // 检查是否已打卡
      const existing = await checkinsCol.where({ habitId, date, openid }).get();
      if (existing.data.length > 0) {
        return { code: -1, msg: '今日已打卡' };
      }
      const res = await checkinsCol.add({
        habitId,
        date,
        openid,
        timestamp: Date.now()
      });
      return { code: 0, id: res.id };
    }
    
    case 'undoCheckin': {
      const { habitId, date } = data;
      await checkinsCol.where({ habitId, date, openid }).remove();
      return { code: 0 };
    }
    
    case 'addMood': {
      const res = await moodsCol.add({
        ...data,
        openid,
        timestamp: Date.now()
      });
      return { code: 0, id: res.id };
    }
    
    default:
      return { code: -1, msg: '未知操作' };
  }
};
