// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Detail.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import Datetime from 'react-datetime';

class Detail extends Component {
  props: {
  };

  renderDatetime = (props, openCalendar) => {
    return (
      <div className={p['form-group']}>
        <label>时间</label>
        <input className={p['form-control']} placeholder="2017-12-7 11:30:30" />
        <button onClick={openCalendar}>open calendar</button>
      </div>
    )
  };

  render() {
    return (
      <div className={s['container']}>
        <form className={s['form']}>
          <label>分类</label>
          <div className={p['radio']}>
            <label>
              <input type="radio" name="beins" />
              Nogroup，无分组
            </label>
          </div>
          <div className={p['radio']}>
            <label>
              <input type="radio" name="beins" />
              Crashme，视频车事故
            </label>
          </div>
          <div className={p['radio']}>
            <label>
              <input type="radio" name="beins" />
              Crashit，非视频车事故
            </label>
          </div>
          <div className={p['radio']}>
            <label>
              <input type="radio" name="beins" />
              Nocrash，没有事故
            </label>
          </div>
          <div className={p['form-group']}>
            <label>标题</label>
          <textarea  className={p['form-control']} rows="1" placeholder="还有这种操作？" />
          </div>
          <div className={p['form-group']}>
            <label>时间</label>
            <input className={p['form-control']} placeholder="2017-12-7 11:30:30" />
          </div>
          <div className={p['form-group']}>
            <label>地点</label>
            <input className={p['form-control']} placeholder="[22.123456, 120.123456]" />
          </div>
          <div className={p['form-group']}>
            <label>播放范围</label>
            <input className={p['form-control']} placeholder="[0, -1]" />
          </div>
          <div className={p['form-group']}>
            <label>事故分类</label>
            <input className={p['form-control']} placeholder="[]" />
          </div>
          <div className={p['form-group']}>
            <label>违章分类</label>
            <input className={p['form-control']} placeholder="[]" />
          </div>
          <div className={p['form-group']}>
            <label>关键字</label>
            <input className={p['form-control']} placeholder="[]" />
          </div>
          <div className={p['form-group']}>
            <label>车牌</label>
          <input className={p['form-control']} placeholder="[{'chars': '粤A123456', 'score': 0.999, 'frame': 1234, 'xmin': 123, 'xmax': 321, 'ymin': 123, 'ymax': 321}]" />
          </div>
        </form>
      </div>
    );
  }
}

export default Detail;
