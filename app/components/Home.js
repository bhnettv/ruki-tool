// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Home.css';
import p from '../photon/dist/css/photon.css';
import Player from './Player';
import Labels from './Labels';
import Videos from './Videos';
import cx from 'classnames';
import FTPClient from 'ftp';
import config from '../config';
import path from 'path';
import type { LabelType } from '../reducers/home';
import { ipcRenderer } from 'electron';

export default class Home extends Component {
  props: {
    isLoadingVideo: boolean,
    loadingVideoErr: ?string,
    isLoadingVideoDir: boolean,
    loadingVideoDirErr: ?string,
    isUpdatingLabels: boolean,
    updatingLabelsErr: ?string,
    video: ?string,
    videoDir: ?string,
    videos: (?string)[],
    videoDirs: (?string)[],
    labels: ?LabelType,
    labelsAt: ?string,
    oldLabels: ?LabelType,
    oldLabelsAt: ?string,
    choseVideo: (string) => void,
    choseVideoDir: (string) => void,
    updateLabels: (LabelType, string) => void,
    editLabels: (LabelType, string) => void,
    closeVideoDir: (string) => void,
  };

  // 启动时加载某个路径的视频
  componentDidMount () {
    const { choseVideoDir } = this.props;
    choseVideoDir('ddpai/ddpai_t6_c0_l1');
  }

  arrayEqual = (a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i+=1) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  };

  renderButons = (labels, oldLabels, labelsAt, oldLabelsAt) => {
    const { editLabels } = this.props;
    if (labelsAt !== oldLabelsAt
      || labels.title !== oldLabels.title
      || labels.datetime !== oldLabels.datetime
      || !this.arrayEqual(labels.coords, oldLabels.coords)
      || !this.arrayEqual(labels.range, oldLabels.range)
      || !this.arrayEqual(labels.crashes, oldLabels.crashes)
      || !this.arrayEqual(labels.rules, oldLabels.rules)
      || !this.arrayEqual(labels.keywords, oldLabels.keywords)
      // || !this.arrayEqual(labels.plates, oldLabels.plates)
    ) {
      return (
        <div className={p['toolbar-actions']}>
          <button className={cx(p['btn'], p['btn-default'])}>
            刷新
          </button>
          <button className={cx(p['btn'], p['btn-primary'], p['pull-right'])}>
            保存
          </button>
          <button
            className={cx(p['btn'], p['btn-default'], p['pull-right'])}
            onClick={(e) => editLabels(oldLabels, oldLabelsAt)}
          >
            取消
          </button>
        </div>
      );
    } else {
      return (
        <div className={p['toolbar-actions']}>
          <button className={cx(p['btn'], p['btn-default'])}>
            刷新
          </button>
        </div>
      )
    }
  };

  render() {
    const {
      isLoadingVideo,
      loadingVideoErr,
      isLoadingVideoDir,
      loadingVideoDirErr,
      isUpdatingLabels,
      updatingLabelsErr,
      videos,
      videoDirs,
      video,
      videoDir,
      labels,
      labelsAt,
      oldLabels,
      oldLabelsAt,
      choseVideo,
      choseVideoDir,
      updateLabels,
      editLabels,
      closeVideoDir,
    } = this.props;
    return (
      <div className={p['window']}>
        <div
          className={p['tab-group']}
        >
          {
            videoDirs.map((vd) => (
              <div
                key={`t-${vd}`}
                className={vd === videoDir? cx(p['tab-item'], p['active']): p['tab-item']}
                onClick={(e) => {
                  if (!isLoadingVideoDir || vd !== videoDir) {
                    choseVideoDir(e.target.childNodes[1].innerHTML);
                  }
                }}
              >
                <span
                  className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}
                  // onClick={() => closeVideoDir(vd)}
                ></span>
                {
                  vd === videoDir && isLoadingVideoDir?
                  (
                    <span>
                      <i className="fa fa-spinner fa-spin fa-fw"></i>
                      <span className="sr-only">加载中...</span>
                    </span>
                  ):
                  (
                    <span>{vd}</span>
                  )
                }
              </div>
            ))
          }
          <div
            className={cx(p['tab-item'], p['tab-item-fixed'])}
            onClick={(e) => {
              ipcRenderer.send('open-file-dialog');
              ipcRenderer.on('selected-directory', (event, param) => choseVideoDir(path.join(param.root, param.sub)))
            }}
          >
            <span className={cx(p['icon'], p['icon-plus'])}></span>
          </div>
        </div>
        <div className={p['window-content']} data-tid="container">
          <div className={p['pane-group']}>
            <div className={cx(p['pane-sm'], p['sidebar'], p['padded-bottom-more'])}>
              <Videos
                videos={videos}
                video={video}
                videoDir={videoDir}
                isLoadingVideo={isLoadingVideo}
                isLoadingVideoDir={isLoadingVideoDir}
                choseVideo={choseVideo}
              />
            </div>
            <div className={p['pane']}>
              <Player
                videoDir={videoDir}
                video={video}
                isLoadingVideoDir={isLoadingVideoDir}
                isLoadingVideo={isLoadingVideo}
                updateLabels={updateLabels}
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
