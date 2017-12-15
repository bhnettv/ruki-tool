// @flow
import { homeStateType } from '../reducers/home';
import FTPClient from 'ftp';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { LABELS_AT } from '../constant';

type actionType = {
  +type: string
};

const getNotes = (vDir) => new Promise((resolve, reject) => {
  const notePath = path.join(config.ftp.macMount, vDir, 'note.json');
  fs.readFile(notePath, 'utf8', (err, data) => {
    if (err || !data) {
      // 如果文件不存在则默认为空
      resolve({});
    } else {
      const jsonData = JSON.parse(data);
      if (jsonData) {
        resolve(jsonData);
      } else {
        resolve({});
      }
    }
  });
});

const setNote = (vDir, v, note) => new Promise((resolve, reject) => {
  const notePath = path.join(config.ftp.macMount, vDir, 'note.json');
  const name = path.basename(v, path.extname(v));
  fs.readFile(notePath, 'utf8', (err, data) => {
    if (err) {
      // 记录文件不存在，则创建新的
      const jsonData = {};
      jsonData[name] = note;
      fs.writeFile(notePath, JSON.stringify(jsonData), 'utf8', (err) => {
        if (err) {
          reject(err);
        }
        resolve({ message: 'ok' });
      });
    } else {
      // 记录文件存在
      if (!data) {
        resolve({ message: 'invalid json file' });
      } else {
        const jsonData = JSON.parse(data);
        if (jsonData) {
          jsonData[name] = note;
          fs.writeFile(notePath, JSON.stringify(jsonData), 'utf8', (err) => {
            if (err) {
              reject(err);
            }
            resolve({ message: 'ok' });
          });
        } else {
          resolve({ message: 'empty json file' });
        }
      }
    }
  });

});

const getDirFiles = (vDir) => new Promise((resolve, reject) => {
  fs.readdir(path.join(config.ftp.macMount, vDir), async (err, files) => {
    if (err) reject(err);
    // 过滤非视频文件
    const filterFiles = files.filter(file =>
      (
        file.endsWith('.mp4') ||
        file.endsWith('.mkv') ||
        file.endsWith('.avi') ||
        file.endsWith('.mov')
      )
    );
    // 降序排序
    const sortFiles = filterFiles.sort((aFile, bFile) => {
      const aName = path.basename(aFile, path.extname(aFile));
      const bName = path.basename(bFile, path.extname(bFile));
      return bName - aName;
    });
    // 分类记录，用于渲染记录颜色
    const notes = await getNotes(vDir);
    resolve({ videos: sortFiles, notes: notes });
  });
});

const getJSONData = (v, j) => new Promise((resolve, reject) => {
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
});

const getFileInfo = (vDir, v) => new Promise(async (resolve, reject) => {
  try {
    // 获取路径
    const regexp = new RegExp(`^(ddpai|s360)/(.+)$`);
    const results = regexp.exec(vDir);
    if (results && results[1] && results[2]) {
      // 先检查crashme目录
      let data = await getJSONData(v, path.join(
        config.ftp.macRawMount,
        results[1],
        'crashme',
        'index.json',
      ));
      let dataAt = 'crashme';
      // 如果没有，则继续检查crashit目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macRawMount,
          results[1],
          'crashit',
          'index.json',
        ));
        dataAt = 'crashit';
      }
      // 如果没有，则继续检查nocrash目录
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        data = await getJSONData(v, path.join(
          config.ftp.macRawMount,
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
        data.title = data.title? String(data.title): '';
        data.datetime = data.datetime? String(data.datetime): '';
        data.range = data.range && data.range.length === 2? data.range.map(r => parseFloat(r)): [0, -1];
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
        if (vData) {
          jsonData[name] = vData;
        } else {
          delete jsonData[name];
        }
        fs.writeFile(j, JSON.stringify(jsonData), 'utf8', (err) => {
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
});

const setFileInfo = (vDir, v, labels, labelsAt, oldLabelsAt) => new Promise(async (resolve, reject) => {
  try {
    // 获取路径
    const regexp = new RegExp(`^(ddpai|s360)/(.+)$`);
    const results = regexp.exec(vDir);
    if (results && results[1] && results[2]) {
      if (labelsAt !== '') {
        // 如果新的视频目录不是原始目录，则添加标签信息到新目录的index.json
        const newMsg = await setJSONData(v, path.join(
          config.ftp.macRawMount,
          results[1],
          labelsAt,
          'index.json',
        ), labels);
        // 然后复制视频文件到新目录
        const rd = fs.createReadStream(
          path.join(
          config.ftp.macMount,
          vDir,
          v,
        ));
        const wr = fs.createWriteStream(
          path.join(
          config.ftp.macRawMount,
          results[1],
          labelsAt,
          v,
        ));
        wr.on('error', (err) => reject(err))
        wr.on('close', async () => {
          if (oldLabelsAt !== labelsAt && oldLabelsAt !== '') {
            // 如果旧的视频目录不是原始目录，则旧目录的index.json标签信息
            const oldMsg = await setJSONData(v, path.join(
              config.ftp.macRawMount,
              results[1],
              oldLabelsAt,
              'index.json',
            ), null);
            // 然后旧目录的删除视频文件
            fs.unlink(path.join(
              config.ftp.macRawMount,
              results[1],
              oldLabelsAt,
              v,
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
    console.log(e);
    reject(e);
  }
});

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';
export const EDIT_LABELS = 'EDIT_LABELS';
export const CLOSE_VIDEO_DIR = 'CLOSE_VIDEO_DIR';
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
}

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

export const updateNote = (videoDir, video, note) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_NOTE,
  });
  return setNote(videoDir, video, note)
  .then(() => {
    dispatch({
      type: UPDATE_NOTE,
      name: path.basename(video, path.extname(video)),
      note: note,
    });
  })
  .catch((err) => {
    console.log(err.message);
    dispatch({
      type: UPDATE_NOTE,
      updatingNoteErr: '超时',
    });
  });
}
