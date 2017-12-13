// @flow
import { homeStateType } from '../reducers/home';
import FTPClient from 'ftp';
import path from 'path';
import fs from 'fs';
import config from '../config';

type actionType = {
  +type: string
};

const getDirFiles = (vDir) => new Promise((resolve, reject) => {
  fs.readdir(path.join(config.ftp.macMount, vDir), (err, files) => {
    if (err) reject(err);
    const videoFiles = files.filter(file =>
      (
        file.endsWith('.mp4') ||
        file.endsWith('.mkv') ||
        file.endsWith('.avi') ||
        file.endsWith('.mov')
      )
    );
    resolve(videoFiles);
  });
});

const getJSONData = (v, j) => new Promise((resolve, reject) => {
  try {
    fs.readFile(j, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      if (!data) {
        resolve({});
      } else {
        const jsonData = JSON.parse(data);
        const name = path.basename(v, path.extname(v));
        if (jsonData && jsonData[name]) {
          resolve(jsonData[name]);
        } else {
          resolve({});
        }
      }
    });
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
        data.title = data.des;
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
        // 类型检查
        data.title = data.title? String(data.title): '';
        data.datetime = data.datetime? String(data.datetime): '';
        data.range = data.range && data.range.length === 2? data.range.map(r => parseInt(r)): [0, -1];
        data.coords = data.coords && data.coords.length === 2? data.coords.map(c => parseFloat(c)): [];
        data.crashes = data.crashes && data.crashes.length > 0? data.crashes.map(c => String(c)): [];
        data.rules = data.rules && data.rules.length > 0? data.rules.map(r => String(r)): [];
        data.keywords && data.keywords.length > 0? data.keywords.map(k => String(k)): [];
        data.plates && data.plates.length > 0? data.plates.map(p => String(p)): [];
        resolve({
          labels: {
            title: data.title || '',
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

const setJSONData = (v, j, vData) => new Promise((resolve, reject) => {
  try {
    fs.readFile(j, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      if (!data) {
        resolve({ message: 'invalid json file' });
      } else {
        const jsonData = JSON.parse(data);
        if (jsonData) {
          const name = path.basename(v, path.extname(v));
          jsonData[name] = vData;
          fs.writeFile(j, jsonData, 'utf8', (err, data) => {
            if (err) {
              reject(err);
            }
            resolve({ message: 'ok' });
          });
          resolve({ message: 'ok' });
        } else {
          resolve({ message: 'empty json file' });
        }
      }
    });
  } catch (e) {
    reject(e);
  }
});

const setFileInfo = (vDir, v, labels, labelsAt) => new Promise((resolve, reject) => {
  // 先添加新信息

  // 再删除原有信息
});

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';
export const EDIT_LABELS = 'EDIT_LABELS';
export const CLOSE_VIDEO_DIR = 'CLOSE_VIDEO_DIR';

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
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO,
      video: video,
      loadingVideoErr: '超时',
    });
  });
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

export const closeVideoDir = (videoDir) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CLOSE_VIDEO_DIR,
    videoDir: videoDir,
  });
  return getDirFiles(videoDir)
  .then((files) => {
    dispatch({
      type: CLOSE_VIDEO_DIR,
      videoDir: videoDir,
      videos: files,
    });
  })
  .catch((err) => {
    dispatch({
      type: CLOSE_VIDEO_DIR,
      videoDir: videoDir,
      loadingVideoDirErr: '超时',
    });
  });
};
