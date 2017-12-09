// @flow
import { CHOSE_VIDEO, CHOSE_VIDEO_DIR } from '../actions/home';

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
  +isLoadingVideoDir: boolean,
  +video: string,
  +videoDir: string,
  +videos: string[],
  +videoDirs: string[],
  +labels: LabelType,
};

type actionType = {
  +type: string
};

export default function home(state: homeStateType = {
  isLoadingVideo: false,
  isLoadingVideoDir: false,
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
}, action: actionType) {
  switch (action.type) {
    case CHOSE_VIDEO:
    {
      const newState = { video: action.video };
      if (action.labels) {
        newState.labels = action.labels;
        newState.isLoadingVideo = false;
      } else {
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
        newState.videos = action.videos;
        newState.isLoading = false;
      } else {
        newState.isLoadingVideo = true;
      }
      return {...state, ...newState};
    }
    default:
      return state;
  }
}
