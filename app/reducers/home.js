// @flow
import { CHOSE_VIDEO, CHOSE_VIDEO_DIR, UPDATE_LABELS } from '../actions/home';

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
}, action: actionType) {
  switch (action.type) {
    case CHOSE_VIDEO:
    {
      const newState = { video: action.video };
      if (action.labels) {
        newState.labels = action.labels;
        newState.labelsAt = action.labelsAt;
        newState.isLoadingVideo = false;
      } else if (action.loadingVideoErr) {
        newState.loadingVideoErr = action.loadingVideoErr;
        newState.isLoadingVideo = false;
      } else {
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
        newState.labelsAt = 'ungroup';
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
        newState.video = state.video && action.videos.length? state.video: action.videos[0];
        newState.videos = action.videos;
        newState.isLoadingVideoDir = false;
      } else if (action.loadingVideoDirErr) {
        newState.loadingVideoDirErr = action.loadingVideoDirErr;
        newState.isLoadingVideoDir = false;
      } else {
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
        newState.labels = action.labels;
        newState.labelsAt = action.labelsAt;
        newState.isLoadingVideoDir = false;
      } else if (action.updatingLabelsErr) {
        newState.updatingLabelsErr = action.updatingLabelsErr;
        newState.isUpdatingLabels = false;
      } else {
        newState.isUpdatingLabels = true;
      }
      return {...state, ...newState};
    }
    default:
      return state;
  }
}
