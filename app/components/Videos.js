// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Videos.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';

export default class Videos extends Component {
  props: {
    isLoadingVideoDir: boolean,
    video: ?string,
    videos: (?string)[],
    choseVideo: (string) => void,
  };

  render() {
    const { isLoadingVideoDir, video, videos, choseVideo } = this.props;
    return (
      <div className={s['container']}>
        {
          isLoadingVideoDir?
          (
            <div>加载中...</div>
          ):
          videos.length > 0?
          (
            <table className={p['table-striped']}>
              <tbody onClick={(e) => choseVideo(e.target.innerHTML)}>
                {videos.map((v, i) => (
                  <tr
                    key={`v-${i}`}
                    className={v === video? s['active']: ''}
                  >
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ):
          (
            <div>没有数据</div>
          )
        }
      </div>
    );
  }
}
