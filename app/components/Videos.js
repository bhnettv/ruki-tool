// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import s from './Videos.css';
import p from '../photon/dist/css/photon.css';
import type { NoteType } from '../reducers/home';

export default class Videos extends Component {
  props: {
    isLoadingVideo: boolean,
    isLoadingVideoMore: boolean,
    isLoadingVideoDir: boolean,
    video: ?string,
    videos: (?string)[],
    videoDir: ?string,
    notes: any,
    choseVideo: (string) => void,
    choseVideoMore: (string) => void,
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
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const index = videos.indexOf(video);
      if (index !== -1) {
        const newIndex = (index < videos.length - 1) ? index + 1 : index;
        choseVideo(videoDir, videos[newIndex]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const index = videos.indexOf(video);
      if (index !== -1) {
        const newIndex = index > 0 ? index - 1 : index;
        choseVideo(videoDir, videos[newIndex]);
      }
    } else {
      // nothing to do
    }
  };

  renderVideoClassName = (v, video, notes) => {
    if (v === video) {
      // 被选中的条目
      if (!notes[v] || !notes[v].color) {
        // 被选中但没有记录的条目
        return s.active;
      }
      if (notes[v].color === 'seen') {
        // 看过的为灰色背景
        return cx(s.active, s.seen);
      } else if (notes[v].color === 'crashme') {
        // 第一视角事故为红色
        return cx(s.active, s.crashme);
      } else if (notes[v].color === 'crashit') {
        // 第三视角事故为黄色
        return cx(s.active, s.crashit);
      } else if (notes[v].color === 'nocrash') {
        // 无事故为绿色
        return cx(s.active, s.nocrash);
      } else {
        // 被选中有记录但不考虑的条目
        return s.active;
      }
    } else {
      // 没被选中的条目
      if (!notes[v] || !notes[v].color) {
        // 没被选中但没有记录的条目
        return '';
      }
      if (notes[v].color === 'seen') {
        return s.seen;
      } else if (notes[v].color === 'crashme') {
        return s.crashme;
      } else if (notes[v].color === 'crashit') {
        return s.crashit;
      } else if (notes[v].color === 'nocrash') {
        return s.nocrash;
      } else {
        // 没被选中有记录但不考虑的条目
        return '';
      }
    }
  };

  renderLoader = () => {
    const {
      isLoadingVideoDir,
      isLoadingVideoMore,
      videoDir,
      videos,
      choseVideoMore,
    } = this.props;
    return (
      <div
        className={s['videos-tip']}
        onClick={() => {
          const video = videos[videos.length - 1];
          choseVideoMore(videoDir, video, 100);
        }}
      >
        <div className={s['videos-tip-text']}>
          {isLoadingVideoDir || isLoadingVideoMore ? '加载中..' : '加载更多'}
        </div>
      </div>
    );
  };

  render() {
    const {
      isLoadingVideo,
      video,
      videos,
      videoDir,
      choseVideo,
      updateNote,
      notes
    } = this.props;
    return (
      <div className={s['container']}>
        <table className={p['table-striped']}>
          <tbody onClick={(e) => {
            const v = e.target.innerHTML;
            if (v && v.match(/^\d+$/) && (!isLoadingVideo || video !== v)) {
              choseVideo(videoDir, e.target.innerHTML);
              if (!notes[v]
                || (notes[v]
                && notes[v].color !== 'crashme'
                && notes[v].color !== 'crashit'
                && notes[v].color !== 'nocrash')) {
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
                  v === video && isLoadingVideo ?
                  (
                    <td>
                      <i className="fa fa-spinner fa-spin fa-fw" />
                      <span className="sr-only">加载中...</span>
                    </td>
                  ) :
                  (
                    <td>{v}</td>
                  )
                }
              </tr>
            ))}
          </tbody>
        </table>
        {this.renderLoader()}
      </div>
    );
  }
}
