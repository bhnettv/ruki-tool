// @flow
import path from 'path';
import fs from 'fs';
import config from '../config';
import { homeStateType } from '../reducers/home';
import { LABELS_AT } from '../constant';

type actionType = {
  +type: string
};

/**
 * 获取视频根目录的历史标注信息，避免重复标注
 * @param {string} vDir 视频根目录
 */
const getNotes = (vDir) => new Promise((resolve) => {
  const notePath = path.join(config.ftp.macMount, vDir, 'note.json');
  fs.readFile(notePath, 'utf8', (rErr, data) => {
    if (rErr || !data) {
      // 如果文件不存在则默认为空
      resolve({});
    }
    try {
      const jsonData = JSON.parse(data);
      if (jsonData) {
        resolve(jsonData);
      } else {
        resolve({});
      }
    } catch (err) {
      resolve({});
    }
  });
});

/**
 * 获取视频根目录下的所有视频文件名，以及标注信息
 * @param {string} vDir 视频根目录
 * @param {number} count 视频个数
 */
const getMoreFiles = (vDir, v, count) => new Promise((resolve) => {
  const indexPath = path.join(config.ftp.macMount, vDir, 'index.json');
  fs.readFile(indexPath, 'utf8', async (rErr, data) => {
    if (rErr || !data) {
      // 如果文件不存在则默认为空
      resolve({ videos: [] });
    }
    try {
      const jsonData = JSON.parse(data);
      if (!jsonData) {
        resolve({ videos: [] });
      }
      const allFiles = Object.keys(jsonData);
      // 降序排序
      const sortFiles = allFiles.sort((aName, bName) => (bName - aName));
      // 获取指定位置v之后的前count个视频
      const cursor = sortFiles.indexOf(v) || 0;
      const sliceFiles = sortFiles.slice(cursor + 1, cursor + 1 + count);
      resolve({ videos: sliceFiles });
    } catch (err) {
      resolve({ videos: [] });
    }
  });
});

/**
 * 获取视频根目录下的所有视频文件名，以及标注信息
 * @param {string} vDir 视频根目录
 */
const getDirFiles = (vDir) => new Promise((resolve) => {
  const indexPath = path.join(config.ftp.macMount, vDir, 'index.json');
  fs.readFile(indexPath, 'utf8', async (rErr, data) => {
    if (rErr || !data) {
      // 如果文件不存在则默认为空
      resolve({ videos: [], notes: [] });
    }
    try {
      const jsonData = JSON.parse(data);
      if (!jsonData) {
        resolve({ videos: [], notes: [] });
      }
      const allFiles = Object.keys(jsonData);
      // 降序排序
      const sortFiles = allFiles.sort((aName, bName) => (bName - aName));
      // 默认获取前200个视频
      const sliceFiles = sortFiles.slice(0, 200);
      // 获取标注信息，用于渲染记录颜色
      const notes = await getNotes(vDir);
      resolve({ videos: sliceFiles, notes });
    } catch (err) {
      resolve({ videos: [], notes: [] });
    }
  });
});

/**
 * 从指定文件获取视频信息
 * @param {string} v 视频ID
 * @param {string} j 视频信息文件路径，JSON格式
 */
const getJSONData = (v, j) => new Promise((resolve) => {
  fs.readFile(j, 'utf8', (rErr, data) => {
    if (rErr || !data) {
      resolve({});
    }
    try {
      const jsonData = JSON.parse(data);
      if (jsonData && jsonData[v]) {
        resolve(jsonData[v]);
      } else {
        resolve({});
      }
    } catch (err) {
      resolve({});
    }
  });
});

/**
 * 尝试从crashme／crashit／nocrash目录获取视频信息
 * 如果没有，则从原始目录获取视频信息，
 * 如果还是没有，则返回默认视频信息
 * @param {string} vDir 视频根目录
 * @param {string} v 视频ID
 */
const getFileInfo = (vDir, v) => new Promise(async (resolve, reject) => {
  try {
    // 获取路径，检查根目录是不是位于ddpai目录或者s360目录下
    const regexp = new RegExp('^(ddpai|s360)/(.+)$');
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
        data.title = data.title ? String(data.title) : '';
        data.datetime = data.datetime ? String(data.datetime) : '';
        data.range = data.range && data.range.length === 2 ? data.range.map(r => parseFloat(r)) : [0, -1];
        data.coords = data.coords && data.coords.length === 2 ? data.coords.map(c => parseFloat(c)) : [];
        data.crashes = data.crashes && data.crashes.length > 0 ? data.crashes.map(c => String(c)) : [];
        data.rules = data.rules && data.rules.length > 0 ? data.rules.map(r => String(r)) : [];
        data.keywords && data.keywords.length > 0 ? data.keywords.map(k => String(k)) : [];
        data.plates && data.plates.length > 0 ? data.plates.map(p => String(p)) : [];
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

/**
 * 设置视频根目录的历史标注信息
 * @param {string} vDir 视频根目录
 * @param {string} v 视频ID
 * @param {object} note 标注信息
 */
const setNote = (vDir, v, note) => new Promise((resolve, reject) => {
  const notePath = path.join(config.ftp.macMount, vDir, 'note.json');
  fs.readFile(notePath, 'utf8', (rErr, data) => {
    if (rErr) {
      // 记录文件不存在，则创建新的
      const jsonData = {};
      jsonData[v] = note;
      fs.writeFile(notePath, JSON.stringify(jsonData), 'utf8', (wErr) => {
        if (wErr) {
          reject(wErr);
        }
        resolve({ message: 'ok' });
      });
    } else {
      // 记录文件存在
      if (!data) {
        resolve({ message: 'invalid json file' });
      }
      try {
        const jsonData = JSON.parse(data);
        if (jsonData) {
          jsonData[v] = note;
          fs.writeFile(notePath, JSON.stringify(jsonData), 'utf8', (wErr) => {
            if (wErr) {
              reject(wErr);
            }
            resolve({ message: 'ok' });
          });
        } else {
          resolve({ message: 'empty json file' });
        }
      } catch (err) {
        resolve(err);
      }
    }
  });
});

/**
 * 保存视频信息到特定文件
 * @param {string} v 视频ID
 * @param {string} j 视频信息文件路径，JSON格式
 * @param {object} vData 视频信息
 */
const setJSONData = (v, j, vData) => new Promise((resolve, reject) => {
  fs.readFile(j, 'utf8', (rErr, data) => {
    if (rErr) {
      reject(rErr);
    }
    if (!data) {
      resolve({ message: 'invalid json file' });
    } else {
      const jsonData = JSON.parse(data);
      if (jsonData) {
        if (vData) {
          jsonData[v] = vData;
        } else {
          delete jsonData[v];
        }
        fs.writeFile(j, JSON.stringify(jsonData), 'utf8', (wErr) => {
          if (wErr) {
            reject(wErr);
          }
          resolve({ message: 'ok' });
        });
      } else {
        resolve({ message: 'empty json file' });
      }
    }
  });
});

/**
 * 保存视频信息到特定文件，并且把视频复制到特定文件夹
 * @param {string} vDir 视频根目录
 * @param {string} v 视频ID
 * @param {*} labels 视频信息
 * @param {*} labelsAt 视频信息新位置
 * @param {*} oldLabelsAt 视频信息旧位置
 */
const setFileInfo = (vDir, v, labels, labelsAt, oldLabelsAt) => new Promise(async (resolve, reject) => {
  try {
    // 获取路径
    const regexp = new RegExp(`^(ddpai|s360)/(.+)$`);
    const results = regexp.exec(vDir);
    // 范围检查
    if (labels.coords.length === 2
      && (labels.coords[0] <= 0
        || labels.coords[0] > 180
        || labels.coords[1] <= 0
        || labels.coords[2] > 90)) {
      labels.coords = [];
    }
    if (results && results[1] && results[2]) {
      if (labelsAt !== '') {
        // 如果新的视频目录不是原始目录，则添加标签信息到新目录的index.json
        const { message: addMsg } = await setJSONData(v, path.join(
          config.ftp.macMount,
          'raw',
          results[1],
          labelsAt,
          'index.json',
        ), labels);
        if (addMsg !== 'ok') {
          resolve({ message: 'add json failed' });
        }
        // 然后复制视频文件到新目录
        const rd = fs.createReadStream(
          path.join(
          config.ftp.macMount,
          vDir,
          `${v}.mp4`,
        ));
        const wr = fs.createWriteStream(
          path.join(
          config.ftp.macMount,
          'raw',
          results[1],
          labelsAt,
          `${v}.mp4`,
        ));
        wr.on('error', (err) => reject(err));
        wr.on('close', async () => {
          if (oldLabelsAt !== labelsAt && oldLabelsAt !== '') {
            // 如果旧的视频目录不是原始目录，则旧目录的index.json标签信息
            const { message: delMsg } = await setJSONData(v, path.join(
              config.ftp.macMount,
              'raw',
              results[1],
              oldLabelsAt,
              'index.json',
            ), null);
            if (delMsg !== 'ok') {
              resolve('delete json failed');
            }
            // 然后旧目录的删除视频文件
            fs.unlink(path.join(
              config.ftp.macMount,
              'raw',
              results[1],
              oldLabelsAt,
              `${v}.mp4`,
            ), (err) => {
              if (err) {
                reject(err);
              }
              resolve({ message: 'ok' });
            });
          } else {
            resolve({ message: 'ok' });
          }
        });
        rd.pipe(wr);
      }
    } else {
      resolve({ message: 'invalid video directory' });
    }
  } catch (e) {
    reject(e);
  }
});

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_MORE = 'CHOSE_VIDEO_MORE';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const CLOSE_VIDEO_DIR = 'CLOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';
export const EDIT_LABELS = 'EDIT_LABELS';
export const UPDATE_NOTE = 'UPDATE_NOTE';

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
};

export const choseVideoMore = (videoDir, video, count) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO_MORE,
  });
  return getMoreFiles(videoDir, video, count)
  .then((data) => {
    dispatch({
      type: CHOSE_VIDEO_MORE,
      videos: data.videos,
    });
  })
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO_MORE,
      loadingVideoMoreErr: '超时',
    });
  });
};

export const choseVideoDir = (videoDir) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO_DIR,
    videoDir: videoDir,
  });
  return getDirFiles(videoDir)
  .then((data) => {
    dispatch({
      type: CHOSE_VIDEO_DIR,
      videoDir: videoDir,
      videos: data.videos,
      notes: data.notes,
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

export const updateLabels = (labels, labelsAt) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_LABELS,
  });
  const { home: { videoDir, video, oldLabelsAt }} = getState();
  return setFileInfo(videoDir, video, labels, labelsAt, oldLabelsAt)
  .then((message) => {
    dispatch({
      type: UPDATE_LABELS,
      labels: labels,
      labelsAt: labelsAt,
    });
  })
  .catch((err) => {
    dispatch({
      type: UPDATE_LABELS,
      updatingLabelsErr: '超时',
    });
  });
};

export const editLabels = (labels, labelsAt) => {
  return {
    type: EDIT_LABELS,
    labels: labels,
    labelsAt: labelsAt,
  };
};

export const updateNote = (videoDir, video, note) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_NOTE,
  });
  return setNote(videoDir, video, note)
  .then(() => {
    dispatch({
      type: UPDATE_NOTE,
      name: video,
      note: note,
    });
  })
  .catch((err) => {
    dispatch({
      type: UPDATE_NOTE,
      updatingNoteErr: '超时',
    });
  });
};
