// @flow
import { homeStateType } from '../reducers/home';
import FTPClient from 'ftp';
import path from 'path';
import fs from 'fs';
import config from '../config';

type actionType = {
  +type: string
};

const client = new FTPClient;
const listDirs = (parent) => new Promise((resolve, reject) => {
  client.list(parent, async (err, dirs) => {
    if (err) reject(err);
    for (let dir of dirs) {
      if (dir.type === 'd') {
        dir.children = await listDirs(path.join(parent, dir.name));
      }
    }
    const data = dirs.map(dir => ({ name: dir.name, children: dir.children }));
    resolve(data);
  });
});
const getDirsTree = (rt) => new Promise((resolve, reject) => {
  client.on('ready', async () => {
    const data = {
      name: rt,
      toggled: true,
      children: await listDirs(path.join(config.ftp.path, rt)),
    };
    resolve(data);
    client.end();
  });
  client.on('error', err => reject(err));
  client.connect({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.pass,
    keepalive: 999999999,
  });
});

const getDirFiles = (vDir) => new Promise((resolve, reject) => {
  client.on('ready', async () => {
    client.list(path.join(config.ftp.path, vDir), async (err, files) => {
      if (err) reject(err);
      const data = [];
      if (files) {
        for (let file of files) {
          if (file.name.endsWith('.mp4') ||
            file.name.endsWith('.mkv') ||
            file.name.endsWith('.avi')
          ) {
            data.push(file.name);
          }
        }
      }
      resolve(data);
      client.end();
    });
  });
  client.on('error', err => reject(err));
  client.connect({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.pass,
    keepalive: 999999999,
  });
});

const getJSONData = (v, j) => new Promise((resolve, reject) => {
  try {
    if (fs.existsSync(j)) {
      const data = fs.readFileSync(j, 'utf8');
      const jsonData = JSON.parse(data);
      const name = path.basename(v, path.extname(v));
      if (jsonData && jsonData[name]) {
        resolve(jsonData[name]);
      } else {
        resolve({});
      }
    } else {
      resolve({});
    }
  } catch (e) {
    reject(e);
  }
});

const getFileInfo = (vDir, v) => new Promise(async (resolve, reject) => {
  try {
    // 获取路径
    const regexp = new RegExp(`^(ddpai|s360)/(.+)$`);
    const results = regexp.exec(vDir);
    if (results && results[1] && results[2]) {
      // 先检查crashme目录
      let data = await getJSONData(v, path.join(
        config.ftp.macMount,
        'raw',
        results[1],
        'crashme',
        'index.json',
      ));
      let dataAt = 'crashme';
      // 如果没有，则继续检查crashit目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macMount,
          'raw',
          results[1],
          'crashit',
          'index.json',
        ));
        dataAt = 'crashit';
      }
      // 如果没有，则继续检查nocrash目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macMount,
          'raw',
          results[1],
          'nocrash',
          'index.json',
        ));
        dataAt = 'nocrash';
      }
      // 如果没有，则继续检查nogroup目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macMount,
          'raw',
          results[1],
          'nogroup',
          'index.json',
        ));
        dataAt = 'nogroup';
      }
      // 还是没有，则继续检查原始目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macMount,
          vDir,
          'index.json',
        ));
        dataAt = '';
      }
      // 返回结果
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        resolve({
          labels: {
            title: '',
            datetime: '',
            range: [0, -1],
            coords: [],
            crashes: [],
            rules: [],
            keywords: [],
            plates: [],
          },
          labelsAt: '',
        });
      } else {
        resolve({
          labels: {
            title: data.des || '',
            datetime: data.datetime || '',
            range: data.range || [0, -1],
            coords: data.coords || [],
            crashes: data.crashes || [],
            rules: data.rules || [],
            keywords: data.keywords || [],
            plates: data.plates || [],
          },
          labelsAt: dataAt,
        });
      }
    }
  } catch (e) {
    reject(e);
  }
});

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';
export const EDIT_LABELS = 'EDIT_LABELS';

export const choseVideo = (videoDir, video) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO,
    video: video,
  });
  return getFileInfo(videoDir, video)
  .then((info) => {
    dispatch({
      type: CHOSE_VIDEO,
      video: video,
      labels: info.labels,
      labelsAt: info.labelsAt,
    })
  })
}

export const choseVideoDir = (videoDir) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO_DIR,
    videoDir: videoDir,
  });
  return getDirFiles(videoDir)
  .then((files) => {
    dispatch({
      type: CHOSE_VIDEO_DIR,
      videoDir: videoDir,
      videos: files,
    });
  })
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO_DIR,
      videoDir: videoDir,
      loadingVideoDirErr: '超时',
    });
  });
};

export const updateLabels = (labels, labelsAt) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_LABELS,
  });
  return setTimeout(() => {
    dispatch({
      type: UPDATE_LABELS,
      labels: labels,
      labelsAt: labelsAt,
    });
  }, 1000);
};

export const editLabels = (labels, labelsAt) => {
  return {
    type: EDIT_LABELS,
    labels: labels,
    labelsAt: labelsAt,
  };
}
