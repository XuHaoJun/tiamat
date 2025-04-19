// import Models
import ForumBoard from './models/forumBoard';
import Discussion from './models/discussion';

import Oauth2Client from './models/oauth2Client';
import User from './models/user';

import appOauth2ClientConfig from './configs/oauth2/app';

async function createDefaultOauth2Client() {
  const oauth2ClientName = appOauth2ClientConfig.name;
  try {
    const oauth2Client = await Oauth2Client.findOne({
      name: oauth2ClientName,
      isOffical: true,
    });
    
    if (!oauth2Client) {
      const args = {
        name: oauth2ClientName,
        isOffical: true,
      };
      const newOauth2Client = new Oauth2Client(args);
      await newOauth2Client.save();
    }
  } catch (err) {
    console.error('Error creating default OAuth2 client:', err);
  }
}

async function createDefaultAdminUser() {
  const email = 'admin@gmail.com';
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({ email, password: 'admin' });
      await newUser.save();
    }
  } catch (err) {
    console.error('Error creating default admin user:', err);
  }
}

function importForumBoard() {
  const names = [
    '地下城物語',
    '神魔之塔',
    '黑色沙漠 BLACK DESERT',
    '英雄聯盟 League of Legends',
    '真三國無雙・斬',
    '封印者：CLOSERS',
    '王冠之戰',
    '少女前線',
    '新楓之谷',
    '陰陽師 Onmyoji',
    'Garena 傳說對決（Realm of Valor）',
    'Fate/Grand Order',
    '白貓 Project',
    '爐石戰記：魔獸英雄傳',
    '三國志曹操傳 Online',
    '遊戲王 決鬥聯盟',
    '怪物彈珠',
    '龍族拼圖 Puzzle & Dragons',
    '尼爾',
    '流亡黯道 Path of Exile',
    '聖光之誓 Valiant Force',
    '召喚圖板 Summons Board',
    'FINAL FANTASY BRAVE EXVIUS',
    'DRAGON BALL Z -七龍珠爆裂激戰-',
    'MARVEL 未來之戰',
    '克魯賽德戰記 Crusaders Quest',
  ];
  const groups = [
    '新手專區',
    '贈送交換',
    '攻略心得',
    '官方情報',
    '公會夥伴',
    '海外板',
    '問答解惑',
    '實況分享',
    '健檢專區',
  ];
  const randomItem = items => items[Math.floor(Math.random() * items.length)];
  let i;
  let name;
  const time = new Date();
  const forumBoards = new Array(names.length);
  for (i = 0; i < names.length; i += 1) {
    name = names[i];
    time.setTime(time.getTime() + i * 10000);
    forumBoards[i] = {
      name,
      popularityCounter: names.length - i,
      createdAt: new Date(time.getTime()),
      updatedAt: new Date(time.getTime()),
      groups: [
        '綜合討論',
        randomItem(groups),
        randomItem(groups),
        randomItem(groups),
        randomItem(groups),
      ],
    };
    forumBoards[i].groups = forumBoards[i].groups.filter(
      (value, index, self) => self.indexOf(value) === index
    );
  }
  const ps = forumBoards.map(forumBoard => {
    return ForumBoard.findOne({ name: forumBoard.name }).then(doc => {
      if (!doc) {
        const newDoc = new ForumBoard(forumBoard);
        return newDoc.save();
      }
      return null;
    });
  });
  return ps;
}

export default async function dummy() {
  try {
    await createDefaultOauth2Client();
    await createDefaultAdminUser();
    await Promise.all(importForumBoard());
    // const stream = ForumBoard.synchronize();
    // stream.on('error', err => {
    //   console.error('ForumBoard sync error:', err);
    // });
  } catch (err) {
    console.error('Error in dummy data initialization:', err);
  }
}
