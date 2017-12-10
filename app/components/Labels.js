// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Labels.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import Datetime from 'react-datetime';
import type { LabelType } from '../reducers/home';
import { LABELS_AT, CRASHES, RULES, KEYWORDS } from '../constant';

export default class Labels extends Component {
  props: {
    labels: ?LabelType,
    labelsAt: ?string,
    isLoadingVideo: boolean,
    isLoadingVideoDir: boolean,
    isUpdatingLabels: boolean,
    updatingLabelsErr: ?string,
    updateLabels: (LabelType, string) => void,
  };

  render() {
    const {
      labels,
      labelsAt,
      isLoadingVideo,
      isLoadingVideoDir,
      isUpdatingLabels,
      updatingLabelsErr,
      updateLabels,
    } = this.props;
    return (
      <div className={s['container']}>
        <form className={s['form']}>
          <div className={p['form-group']}>
            <label htmlFor="labelsAt">视频位置</label>
            <select
              className={p['form-control']}
              name="labelsAt"
              id="labelsAt"
              value={labelsAt}
              onChange={(e) => updateLabels(labels, e.target.value) }
            >
              {
                LABELS_AT.map((t) => <option key={`at-${t.value}`} value={t.value}>{t.name}</option>)
              }
            </select>
          </div>
          <div className={p['form-group']}>
            <label htmlFor="title">标题</label>
            <textarea
              className={p['form-control']}
              name="title"
              id="title"
              rows="1"
              value={labels.title}
              // onChange={(e) => {
              //   labels.title = e.target.value;
              //   updateLabels(labels, labelsAt);
              // }}
              placeholder="还有这种操作？"
            />
          </div>
          <div className={p['form-group']}>
            <label htmlFor="datetime">时间</label>
            <input
              type="datetime-local"
              className={p['form-control']}
              name="datetime"
              id="datetime"
              value={labels.datetime}
              onChange={(e) => {
                labels.datetime = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              placeholder="2017-12-7 11:30:30"
            />
          </div>
          <div className={p['form-group']}>
            <label htmlFor="coords">地点</label>
            <input
              className={p['form-control']}
              name="coords"
              id="coords"
              value={labels.coords}
              onChange={(e) => {
                labels.coords = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              placeholder="[22.123456, 120.123456]"
            />
          </div>
          <div className={p['form-group']}>
            <label htmlFor="range">播放范围</label>
            <input
              className={p['form-control']}
              name="range"
              id="range"
              value={labels.range}
              disabled
              placeholder="[0, -1]"
            />
          </div>
          <div className={p['form-group']}>
            <label htmlFor="crashes">事故分类</label>
            <select
              className={p['form-control']}
              name="crashes"
              id="crashes"
              value={labels.crashes}
              onChange={(e) => {
                console.log(e.target.options);
                labels.crashes = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              multiple
            >
              {
                CRASHES.map(crash => <option key={`crash-${crash.value}`} value={crash.value}>{crash.name}</option>)
              }
            </select>
          </div>
          <div className={p['form-group']}>
            <label htmlFor="rules">违章分类</label>
            <select
              className={p['form-control']}
              name="rules"
              id="rules"
              value={labels.rules}
              onChange={(e) => {
                labels.rules = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              multiple
            >
              {
                RULES.map(rule => <option key={`rule-${rule.value}`} value={rule.value}>{rule.name}</option>)
              }
            </select>
          </div>
          <div className={p['form-group']}>
            <label htmlFor="keywords">关键字</label>
            <select
              className={p['form-control']}
              name="keywords"
              id="keywords"
              value={labels.keywords}
              onChange={(e) => {
                labels.keywords = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              multiple
            >
              {
                KEYWORDS.map(keyword => <option key={`keyword-${keyword.value}`} value={keyword.value}>{keyword.name}</option>)
              }
            </select>
          </div>
          <div className={p['form-group']}>
            <label htmlFor="plates">车牌</label>
            <input
              className={p['form-control']}
              name="plates"
              id="plates"
              value={labels.plates}
              onChange={(e) => {
                labels.plates = e.target.value;
                updateLabels(labels, labelsAt);
              }}
              disabled
              placeholder="[{'chars': '粤A123456', 'score': 0.999, 'frame': 1234, 'xmin': 123, 'xmax': 321, 'ymin': 123, 'ymax': 321}]"
            />
          </div>
        </form>
      </div>
    );
  }
}
