// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Videos.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';

export default class Videos extends Component {
  props: {
    isLoadingVideo: boolean,
    isLoadingVideoDir: boolean,
    video: ?string,
    videos: (?string)[],
    videoDir: ?string,
    choseVideo: (string) => void,
  };

  // componentDidMount() {
  //   this.container.addEventListener("keydown", this.handleKeyDown, false);
  // }
  // componentWillUnmount() {
  //   this.container.removeEventListener("keydown", this.handleKeyDown, false);
  // }
  // // 键盘按键监听
  // handleKeyDown = (e) => {
  //   console.log(e.key);
  //   e.preventDefault();
  // };

  render() {
    const {
      isLoadingVideo,
      isLoadingVideoDir,
      video,
      videos,
      videoDir,
      choseVideo,
    } = this.props;
    return (
      <div
        className={s['container']}
        ref={(input) => { this.container = input; }}
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
                  if (!isLoadingVideo || video !== e.target.innerHTML) {
                    choseVideo(videoDir, e.target.innerHTML);
                  }
                }}>
                {videos.map((v, i) => (
                  <tr
                    key={`v-${i}`}
                    className={v === video? s['active']: ''}
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
