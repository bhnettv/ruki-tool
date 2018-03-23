// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { ipcRenderer } from 'electron';
import path from 'path';
import s from './Home.css';
import p from '../photon/dist/css/photon.css';
import Player from './Player';
import Labels from './Labels';
import Videos from './Videos';
import { getMediaPath } from '../config';
import type { LabelType, NoteType } from '../reducers/home';


export default class Home extends Component {
  props: {
    isLoadingVideo: boolean,
    loadingVideoErr: ?string,
    isLoadingVideoMore: boolean,
    loadingVideoMoreErr: ?string,
    isLoadingVideoDir: boolean,
    loadingVideoDirErr: ?string,
    isUpdatingLabels: boolean,
    updatingLabelsErr: ?string,
    isUpdatingNote: boolean,
    updatingNoteErr: ?string,
    video: ?string,
    videoDir: ?string,
    videos: (?string)[],
    videoDirs: (?string)[],
    labels: ?LabelType,
    labelsAt: ?string,
    oldLabels: ?LabelType,
    oldLabelsAt: ?string,
    notes: any,
    choseVideo: (string) => void,
    choseVideoMore: (string) => void,
    choseVideoDir: (string) => void,
    updateLabels: (LabelType, string) => void,
    editLabels: (LabelType, string) => void,
    closeVideoDir: (string) => void,
    updateNote: (string, string, NoteType) => void,
  };

  // 启动时加载某个路径的视频
  componentDidMount() {
    // const { choseVideoDir } = this.props;
    // choseVideoDir('ddpai/ddpai_t30_c1_l1');
  }

  arrayEqual = (a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  };

  renderButons = (labels, oldLabels, labelsAt, oldLabelsAt) => {
    const {
      editLabels,
      updateLabels,
      isUpdatingLabels,
      updateNote,
      videoDir,
      video,
    } = this.props;
    if (labelsAt
      && (labelsAt !== oldLabelsAt
      || labels.title !== oldLabels.title
      || labels.datetime !== oldLabels.datetime
      || !this.arrayEqual(labels.coords, oldLabels.coords)
      || !this.arrayEqual(labels.range, oldLabels.range)
      || !this.arrayEqual(labels.crashes, oldLabels.crashes)
      || !this.arrayEqual(labels.rules, oldLabels.rules)
      || !this.arrayEqual(labels.keywords, oldLabels.keywords)
      // || !this.arrayEqual(labels.plates, oldLabels.plates)
    )) {
      return (
        <div className={p['toolbar-actions']}>
          <div className={s['status']}>
            {`路径：${path.join(getMediaPath(), videoDir, video)}`}
          </div>
          <button
            className={cx(p['btn'], p['btn-primary'], p['pull-right'])}
            onClick={() => {
              updateLabels(labels, labelsAt);
              updateNote(videoDir, video, { color: labelsAt });
            }}
          >
            {
              isUpdatingLabels ?
              (
                <span>
                  <i className="fa fa-spinner fa-spin fa-fw" />
                  <span className="sr-only">加载中...</span>
                </span>
              ) :
              (
                <span>
                  保存
                </span>
              )
            }
          </button>
          <button
            className={cx(p['btn'], p['btn-default'], p['pull-right'])}
            onClick={(e) => editLabels(oldLabels, oldLabelsAt)}
            disabled={isUpdatingLabels}
          >
            重置
          </button>
        </div>
      );
    } else {
      return (
        <div className={p['toolbar-actions']}>
          <div className={s['status']}>
            {`路径：${path.join(getMediaPath(), videoDir, video)}`}
          </div>
        </div>
      )
    }
  };

  render() {
    const {
      isLoadingVideo,
      loadingVideoErr,
      isLoadingVideoMore,
      loadingVideoMoreErr,
      isLoadingVideoDir,
      loadingVideoDirErr,
      isUpdatingLabels,
      updatingLabelsErr,
      isUpdatingNote,
      updatingNoteErr,
      videos,
      videoDirs,
      video,
      videoDir,
      labels,
      labelsAt,
      oldLabels,
      oldLabelsAt,
      notes,
      choseVideo,
      choseVideoMore,
      choseVideoDir,
      updateLabels,
      editLabels,
      closeVideoDir,
      updateNote,
    } = this.props;
    return (
      <div className={p['window']}>
        <div className={p['tab-group']}>
          {
            videoDirs.map((vd) => (
              <div
                key={`t-${vd}`}
                className={vd === videoDir ? cx(p['tab-item'], p['active']) : p['tab-item']}
                onClick={(e) => {
                  if (!isLoadingVideoDir || vd !== videoDir) {
                    choseVideoDir(e.target.childNodes[1].innerHTML);
                  }
                }}
              >
                <span
                  className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}
                  onClick={() => closeVideoDir(vd)}
                />
                {
                  vd === videoDir && isLoadingVideoDir ?
                  (
                    <span>
                      <i className="fa fa-spinner fa-spin fa-fw" />
                      <span className="sr-only">加载中...</span>
                    </span>
                  ) :
                  (
                    <span>{vd}</span>
                  )
                }
              </div>
            ))
          }
          <div
            className={cx(p['tab-item'], p['tab-item-fixed'])}
            onClick={() => {
              ipcRenderer.send('open-file-dialog');
              ipcRenderer.on('selected-directory', (event, param) => choseVideoDir(path.join(param.root, param.sub)));
            }}
          >
            <span className={cx(p['icon'], p['icon-plus'])} />
          </div>
        </div>
        <div className={p['window-content']} data-tid="container">
          <div className={p['pane-group']}>
            <div className={cx(p['pane-sm'], p['sidebar'], p['padded-bottom-more'], s['pane-videos'])}>
              <Videos
                videos={videos}
                video={video}
                videoDir={videoDir}
                notes={notes}
                isLoadingVideo={isLoadingVideo}
                isLoadingVideoDir={isLoadingVideoDir}
                isLoadingVideoMore={isLoadingVideoMore}
                choseVideo={choseVideo}
                choseVideoMore={choseVideoMore}
                updateNote={updateNote}
              />
            </div>
            <div className={p['pane']}>
              <Player
                videoDir={videoDir}
                video={video}
                labels={labels}
                labelsAt={labelsAt}
                isLoadingVideoDir={isLoadingVideoDir}
                isLoadingVideo={isLoadingVideo}
                editLabels={editLabels}
              />
            </div>
            <div className={cx(p['sidebar'], s['pane-labels'])}>
              <Labels
                videoDir={videoDir}
                labels={labels}
                labelsAt={labelsAt}
                isLoadingVideoDir={isLoadingVideoDir}
                isLoadingVideo={isLoadingVideo}
                isUpdatingLabels={isUpdatingLabels}
                updatingLabelsErr={updatingLabelsErr}
                updateLabels={updateLabels}
                editLabels={editLabels}
              />
            </div>
          </div>
        </div>
        <footer className={cx(p['toolbar'], p['toolbar-footer'])}>
          {
            this.renderButons(labels, oldLabels, labelsAt, oldLabelsAt)
          }
        </footer>
      </div>
    );
  }
}
