// @flow
import {
  CHOSE_VIDEO,
  CHOSE_VIDEO_DIR,
  UPDATE_LABELS,
  EDIT_LABELS,
  CLOSE_VIDEO_DIR,
} from '../actions/home';

export type LabelType = {
  title: string,
  datetime: string,
  range: number[],
  coords: (?number)[],
  crashes: (?string)[],
  rules: (?string)[],
  keywords: (?string)[],
  plates: (?string)[],
}

export type homeStateType = {
  +isLoadingVideo: boolean,
  +loadingVideoErr: string,
  +isLoadingVideoDir: boolean,
  +loadingVideoDirErr: string,
  +isUpdatingLabels: boolean,
  +updatingLabelsErr: string,
  +video: string,
  +videoDir: string,
  +videos: string[],
  +videoDirs: string[],
  +labels: LabelType,
  +labelsAt: string,
  +oldLabels: LabelType,
  +oldLabelsAt: string,
};

type actionType = {
  +type: string
};

export default function home(state: homeStateType = {
  isLoadingVideo: false,
  loadingVideoErr: '',
  isLoadingVideoDir: false,
  loadingVideoDirErr: '',
  isUpdatingLabels: false,
  updatingLabelsErr: '',
  video: '',
  videoDir: '',
  videos: [],
  videoDirs: [],
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
  oldLabels: {
    title: '',
    datetime: '',
    range: [0, -1],
    coords: [],
    crashes: [],
    rules: [],
    keywords: [],
    plates: [],
  },
  oldLabelsAt: '',
}, action: actionType) {
  switch (action.type) {
    case CHOSE_VIDEO:
    {
      const newState = { video: action.video };
      if (action.labels) {
        // 异步执行成功，更新labels状态
        newState.labels = action.labels;
        newState.labelsAt = action.labelsAt;
        newState.oldLabels = action.labels,
        newState.oldLabelsAt = action.labelsAt;
        newState.isLoadingVideo = false;
      } else if (action.loadingVideoErr) {
        // 异步执行失败
        newState.loadingVideoErr = action.loadingVideoErr;
        newState.isLoadingVideo = false;
      } else {
        // 异步执行开始，重置labels状态
        newState.labels = {
          title: '',
          datetime: '',
          range: [0, -1],
          coords: [],
          crashes: [],
          rules: [],
          keywords: [],
          plates: [],
        };
        newState.labelsAt = '';
        newState.oldLabels = {
          title: '',
          datetime: '',
          range: [0, -1],
          coords: [],
          crashes: [],
          rules: [],
          keywords: [],
          plates: [],
        };
        newState.oldLabelsAt = '';
        newState.isLoadingVideo = true;
      }
      return {...state, ...newState};
    }
    case CHOSE_VIDEO_DIR:
    {
      const newState = {
        videoDir: action.videoDir,
        videoDirs: state.videoDirs.indexOf(action.videoDir) === -1? [...state.videoDirs, action.videoDir]: state.videoDirs,
      };
      if (action.videos) {
        // 异步执行成功，更新videos状态
        newState.video = state.video && action.videos.length? state.video: action.videos[0];
        newState.videos = action.videos;
        newState.isLoadingVideoDir = false;
      } else if (action.loadingVideoDirErr) {
        // 异步执行失败
        newState.loadingVideoDirErr = action.loadingVideoDirErr;
        newState.isLoadingVideoDir = false;
      } else {
        // 异步执行开始
        newState.video = '';
        newState.videos = [];
        newState.isLoadingVideoDir = true;
      }
      return {...state, ...newState};
    }
    case UPDATE_LABELS:
    {
      const newState = {};
      if (action.labels && action.labelsAt) {
        // 异步执行成功，更新旧的labels和labelsAt
        newState.oldLabels = action.labels;
        newState.oldLabelsAt = action.labelsAt;
        newState.isUpdatingLabels = false;
      } else if (action.updatingLabelsErr) {
        // 异步执行失败
        newState.updatingLabelsErr = action.updatingLabelsErr;
        newState.isUpdatingLabels = false;
      } else {
        newState.isUpdatingLabels = true;
      }
      return {...state, ...newState};
    }
    case EDIT_LABELS:
    {
      const newState = {
        labels: action.labels,
        labelsAt: action.labelsAt,
      };
      return {...state, ...newState};
    }
    case CLOSE_VIDEO_DIR:
    {
      const newState = {
        videoDir: action.videoDir,
        videoDirs: state.videoDirs.filter((vDir) => vDir !== action.videoDir),
      };
      if (action.videos) {
        // 异步执行成功，更新videos状态
        newState.video = state.video && action.videos.length? state.video: action.videos[0];
        newState.videos = action.videos;
        newState.isLoadingVideoDir = false;
      } else if (action.loadingVideoDirErr) {
        // 异步执行失败
        newState.loadingVideoDirErr = action.loadingVideoDirErr;
        newState.isLoadingVideoDir = false;
      } else {
        // 异步执行开始
        newState.video = '';
        newState.videos = [];
        newState.isLoadingVideoDir = true;
      }
      return {...state, ...newState};
    }
    default:
      return state;
  }
}
