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
import { getMediaPath, setUserPath } from '../config';
import type { LabelType, NoteType } from '../reducers/home';


export default class Home extends Component {
  props: {
    // 加载视频
    isLoadingVideo: boolean,
    loadingVideoErr: ?string,
    // 加载更多视频
    isLoadingVideoMore: boolean,
    loadingVideoMoreErr: ?string,
    // 加载视频路径
    isLoadingVideoDir: boolean,
    loadingVideoDirErr: ?string,
    // 更新视频标注信息
    isUpdatingLabels: boolean,
    updatingLabelsErr: ?string,
    // 更新视频注释信息
    isUpdatingNote: boolean,
    updatingNoteErr: ?string,
    // 自动识别视频标注信息的时间
    isScaningDateTime: boolean,
    scaningDateTimeErr: ?string,
    // 当前选中的视频
    video: ?string,
    // 当前选中的视频路径
    videoDir: ?string,
    // 当前选中的视频路径下显示的视频
    videos: (?string)[],
    // 加载过的视频路径
    videoDirs: (?string)[],
    // 修改后的视频标注信息
    labels: ?LabelType,
    labelsAt: ?string,
    // 修改前的视频标注信息
    oldLabels: ?LabelType,
    oldLabelsAt: ?string,
    // 注释信息
    notes: any,
    // Ations
    choseVideo: (string) => void,
    choseVideoMore: (string) => void,
    choseVideoDir: (string) => void,
    updateLabels: (LabelType, string) => void,
    editLabels: (LabelType, string) => void,
    closeVideoDir: (string) => void,
    updateNote: (string, string, NoteType) => void,
    scanDateTime: (string, string) => void,
  };

  componentDidMount() {
    // 启动时加载某个路径的视频
    ipcRenderer.send('get-userPath');
    ipcRenderer.on('return-userPath', (event, param) => setUserPath(param));
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

  renderButtons = () => {
    const {
      labels,
      labelsAt,
      oldLabels,
      oldLabelsAt,
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
      );
    }
  };

  renderTabs = () => {
    const {
      isLoadingVideoDir,
      loadingVideoDirErr,
      videoDirs,
      videoDir,
      choseVideoDir,
      closeVideoDir,
    } = this.props;
    return (
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
        ><span className={cx(p['icon'], p['icon-plus'])} /></div>
      </div>
    );
  };

  render() {
    return (
      <div className={p['window']}>
        {this.renderTabs()}
        <div className={p['window-content']} data-tid="container">
          <div className={p['pane-group']}>
            <div className={cx(p['pane-sm'], p['sidebar'], p['padded-bottom-more'], s['pane-videos'])}><Videos {...this.props} /></div>
            <div className={p['pane']}><Player {...this.props} /></div>
            <div className={cx(p['sidebar'], s['pane-labels'])}><Labels {...this.props} /></div>
          </div>
        </div>
        <footer className={cx(p['toolbar'], p['toolbar-footer'])}>{this.renderButtons()}</footer>
      </div>
    );
  }
}
