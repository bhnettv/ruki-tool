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
    video: ?string,
    videoDir: ?string,
    videos: (?string)[],
    videoDirs: (?string)[],
    labels: ?LabelType,
    choseVideo: (string) => void,
    choseVideoDir: (string) => void,
  };

  render() {
    const {
      isLoadingVideo,
      loadingVideoErr,
      isLoadingVideoDir,
      loadingVideoDirErr,
      videos,
      videoDirs,
      video,
      videoDir,
      labels,
      choseVideo,
      choseVideoDir,
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
                <span className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}></span>
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
              />
            </div>
            <div className={cx(p['pane-sm'], p['sidebar'])}>
              <Labels
                labels={labels}
                isLoadingVideoDir={isLoadingVideoDir}
                isLoadingVideo={isLoadingVideo}
              />
            </div>
          </div>
        </div>
        <footer className={cx(p['toolbar'], p['toolbar-footer'])}>
          <h1 className={p['title']}>Footer</h1>
        </footer>
      </div>
    );
  }
}
