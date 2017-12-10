// @flow
import { homeStateType } from '../reducers/home';
import FTPClient from 'ftp';
import path from 'path';
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
    });
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

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';

export const choseVideo = (video) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO,
    video: video,
  });
  return setTimeout(() => {
    dispatch({
      type: CHOSE_VIDEO,
      video: video,
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
      labelsAt: 'ungroup',
    });
  }, 1000);
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
