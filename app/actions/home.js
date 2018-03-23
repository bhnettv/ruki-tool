// @flow
import { homeStateType } from '../reducers/home';
import {
  setFileInfo,
  getFileInfo,
  getMoreFiles,
  getDirFiles,
  setNote,
  getDateTime,
} from '../utils/utils';

type actionType = {
  +type: string
};

export const CHOSE_VIDEO = 'CHOSE_VIDEO';
export const CHOSE_VIDEO_MORE = 'CHOSE_VIDEO_MORE';
export const CHOSE_VIDEO_DIR = 'CHOSE_VIDEO_DIR';
export const CLOSE_VIDEO_DIR = 'CLOSE_VIDEO_DIR';
export const UPDATE_LABELS = 'UPDATE_LABELS';
export const EDIT_LABELS = 'EDIT_LABELS';
export const SCAN_DATETIME = 'SCAN_DATETIME';
export const UPDATE_NOTE = 'UPDATE_NOTE';

export const choseVideo = (videoDir, video) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO,
    video,
  });
  return getFileInfo(videoDir, video)
  .then((info) => dispatch({
    type: CHOSE_VIDEO,
    video,
    labels: info.labels,
    labelsAt: info.labelsAt,
  }))
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO,
      video,
      loadingVideoErr: `超时: ${err}`,
    });
  });
};

export const choseVideoMore = (videoDir, video, count) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO_MORE,
  });
  return getMoreFiles(videoDir, video, count)
  .then((data) => dispatch({
    type: CHOSE_VIDEO_MORE,
    videos: data.videos,
  }))
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO_MORE,
      loadingVideoMoreErr: `超时: ${err}`,
    });
  });
};

export const choseVideoDir = (videoDir) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: CHOSE_VIDEO_DIR,
    videoDir,
  });
  return getDirFiles(videoDir)
  .then((data) => dispatch({
    type: CHOSE_VIDEO_DIR,
    videoDir,
    videos: data.videos,
    notes: data.notes,
  }))
  .catch((err) => {
    dispatch({
      type: CHOSE_VIDEO_DIR,
      videoDir,
      loadingVideoDirErr: `超时: ${err}`,
    });
  });
};

export const closeVideoDir = (videoDir) => ({
  type: CLOSE_VIDEO_DIR,
  videoDir,
});

export const updateLabels = (labels, labelsAt) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_LABELS,
  });
  const { home: { videoDir, video, oldLabelsAt } } = getState();
  return setFileInfo(videoDir, video, labels, labelsAt, oldLabelsAt)
  .then(() => dispatch({
    type: UPDATE_LABELS,
    labels,
    labelsAt,
  }))
  .catch((err) => {
    dispatch({
      type: UPDATE_LABELS,
      updatingLabelsErr: `超时: ${err}`,
    });
  });
};

export const editLabels = (labels, labelsAt) => {
  return {
    type: EDIT_LABELS,
    labels,
    labelsAt,
  };
};

export const updateNote = (videoDir, video, note) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: UPDATE_NOTE,
  });
  return setNote(videoDir, video, note)
  .then(() => dispatch({
    type: UPDATE_NOTE,
    name: video,
    note,
  }))
  .catch((err) => {
    dispatch({
      type: UPDATE_NOTE,
      updatingNoteErr: `超时: ${err}`,
    });
  });
};

export const scanDateTime = (videoDir, video) => (dispatch: (action: actionType) => void, getState: () => homeStateType) => {
  dispatch({
    type: SCAN_DATETIME,
  });
  return getDateTime(videoDir, video)
  .then((datetime) => dispatch({
    type: SCAN_DATETIME,
    datetime,
  }))
  .catch((err) => {
    dispatch({
      type: SCAN_DATETIME,
      scanDateTimeErr: `超时: ${err}`,
    });
  });
};
