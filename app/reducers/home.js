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
  +loadingVideoErr: string,
  +isLoadingVideoDir: boolean,
  +loadingVideoDirErr: string,
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
  loadingVideoErr: '',
  isLoadingVideoDir: false,
  loadingVideoDirErr: '',
  video: '',
  videoDir: 'ddpai/ddpai_t6_c0_l1',
  videos: [],
  videoDirs: ['ddpai/ddpai_t6_c0_l1'],
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
      } else if (action.loadingVideoErr) {
        newState.loadingVideoErr = action.loadingVideoErr;
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
        newState.isLoadingVideoDir = false;
      } else if (action.loadingVideoDirErr) {
        newState.loadingVideoDirErr = action.loadingVideoDirErr;
        newState.isLoadingVideoDir = false;
      } else {
        newState.isLoadingVideoDir = true;
      }
      return {...state, ...newState};
    }
    default:
      return state;
  }
}
