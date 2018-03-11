// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Videos.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import type { NoteType } from '../reducers/home';
import path from 'path';

export default class Videos extends Component {
  props: {
    isLoadingVideo: boolean,
    isLoadingVideoDir: boolean,
    video: ?string,
    videos: (?string)[],
    videoDir: ?string,
    notes: any,
    choseVideo: (string) => void,
    updateNote: (string, string, NoteType) => void,
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }
  // 键盘按键监听
  handleKeyDown = (e) => {
    const { video, videos, choseVideo, videoDir } = this.props;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const index = videos.indexOf(video);
      if (index !== -1) {
        const newIndex = (index < videos.length - 1)? index + 1: index;
        choseVideo(videoDir, videos[newIndex]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const index = videos.indexOf(video);
      if (index !== -1) {
        const newIndex = index > 0? index - 1: index;
        choseVideo(videoDir, videos[newIndex]);
      }
    } else {
      // nothing to do
    }
  };

  renderVideoClassName = (v, video, notes) => {
    const name = path.basename(v, path.extname(v));
    if (v === video) {
      // 被选中的条目
      if (!notes[name] || !notes[name]['color']) {
        // 被选中但没有记录的条目
        return s['active'];
      }
      if (notes[name]['color'] === 'seen') {
        // 看过的为灰色背景
        return cx(s['active'], s['seen']);
      } else if (notes[name]['color'] === 'crashme') {
        // 第一视角事故为红色
        return cx(s['active'], s['crashme']);
      } else if (notes[name]['color'] === 'crashit') {
        // 第三视角事故为黄色
        return cx(s['active'], s['crashit']);
      } else if (notes[name]['color'] === 'nocrash') {
        // 无事故为绿色
        return cx(s['active'], s['nocrash']);
      } else {
        // 被选中有记录但不考虑的条目
        return s['active'];
      }
    } else {
      // 没被选中的条目
      if (!notes[name] || !notes[name]['color']) {
        // 没被选中但没有记录的条目
        return '';
      }
      if (notes[name]['color'] === 'seen') {
        return s['seen'];
      } else if (notes[name]['color'] === 'crashme') {
        return s['crashme'];
      } else if (notes[name]['color'] === 'crashit') {
        return s['crashit'];
      } else if (notes[name]['color'] === 'nocrash') {
        return s['nocrash'];
      } else {
        // 没被选中有记录但不考虑的条目
        return '';
      }
    }
  };

  render() {
    const {
      isLoadingVideo,
      isLoadingVideoDir,
      video,
      videos,
      videoDir,
      choseVideo,
      updateNote,
      notes
    } = this.props;
    return (
      <div
        className={s['container']}
        //ref={(input) => { this.container = input; }}
      >
        {
          isLoadingVideoDir?
          (
            <div className={s['videos-tip']}>
              <div className={s['videos-tip-text']}>
                加载中...
              </div>
            </div>
          ):
          videos.length > 0?
          (
            <table className={p['table-striped']}>
              <tbody onClick={(e) => {
                  const v = e.target.innerHTML;
                  if (v && v.endsWith('.mp4') && (!isLoadingVideo || video !== v)) {
                    choseVideo(videoDir, e.target.innerHTML);
                    const name = path.basename(v, path.extname(v));
                    if (!notes[name]
                      || (notes[name]
                      && notes[name]['color'] !== 'crashme'
                      && notes[name]['color'] !== 'crashit'
                      && notes[name]['color'] !== 'nocrash')) {
                      updateNote(videoDir, v, { color: 'seen' });
                    }
                  }
                }}>
                {videos.map((v, i) => (
                  <tr
                    key={`v-${i}`}
                    className={this.renderVideoClassName(v, video, notes)}
                  >
                    {
                      v === video && isLoadingVideo?
                      (
                        <td>
                          <i className="fa fa-spinner fa-spin fa-fw"></i>
                          <span className="sr-only">加载中...</span>
                        </td>
                      ):
                      (
                        <td>{v}</td>
                      )
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          ):
          (
            <div className={s['videos-tip']}>
              <div className={s['videos-tip-text']}>
                没有数据
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
