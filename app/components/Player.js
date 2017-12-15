// @flow
import path from 'path';
import React, { Component } from 'react';
import { remote } from 'electron';
import { ReactMPV } from 'mpv.js';
import { Link } from 'react-router-dom';
import s from './Player.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import config from '../config';
import type { LabelType } from '../reducers/home';

export default class Player extends Component {
  props: {
    labels: ?LabelType,
    labelsAt: ?string,
    isLoadingVideo: boolean,
    isLoadingVideoDir: boolean,
    video: ?string,
    videoDir: ?string,
    editLabels: (LabelType, string) => void,
  };

  constructor(props) {
    super(props);
    this.mpv = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 0,
      fullscreen: false,
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMPVReady = this.handleMPVReady.bind(this);
    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleSeek = this.handleSeek.bind(this);
    this.handleSeekMouseDown = this.handleSeekMouseDown.bind(this);
    this.handleSeekMouseUp = this.handleSeekMouseUp.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
  }
  componentDidMount() {
    this.container.addEventListener("keydown", this.handleKeyDown, false);
  }
  componentWillUnmount() {
    this.container.removeEventListener("keydown", this.handleKeyDown, false);
  }
  // 键盘按键监听，除了f和esc，其他按键按照mpv处理
  handleKeyDown(e) {
    e.preventDefault();
    if (e.key === "f" || (e.key === "Escape" && this.state.fullscreen)) {
      this.toggleFullscreen();
    } else if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && this.state.duration) {
      this.mpv.keypress(e);
    }
  }
  // mpv监听属性变化
  handleMPVReady(mpv) {
    this.mpv = mpv;
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    // this.mpv.command("loadfile", path.join(__dirname, "tos.mkv"));
  }
  // mpv属性与state绑定
  handlePropertyChange(name, value) {
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    } else {
      this.setState({[name]: value});
    }
  }
  // 切换全屏幕
  toggleFullscreen() {
    if (this.state.fullscreen) {
      document.webkitExitFullscreen();
    } else {
      this.mpv.fullscreen();
    }
    this.setState({fullscreen: !this.state.fullscreen});
  }
  // 切换暂停
  togglePause(e) {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.property("pause", !this.state.pause);
  }
  // 停止播放
  handleStop(e) {
    e.target.blur();
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.setState({"time-pos": 0, duration: 0});
  }
  // 跳转按下
  handleSeekMouseDown() {
    this.seeking = true;
  }
  // 执行跳转
  handleSeek(e) {
    e.target.blur();
    const timePos = +e.target.value;
    this.setState({"time-pos": timePos});
    this.mpv.property("time-pos", timePos);
  }
  // 跳转按键
  handleSeekMouseUp() {
    this.seeking = false;
  }
  // 加载文件
  handleLoad(e) {
    e.target.blur();
    const items = remote.dialog.showOpenDialog({filters: [
      {name: "Videos", extensions: ["mkv", "mp4", "mov", "avi"]},
      {name: "All files", extensions: ["*"]},
    ]});
    if (items) {
      this.mpv.command("loadfile", items[0]);
    }
  }
  // 如果videoDir和video发生变化，则加载视频文件
  componentWillReceiveProps (nextProps) {
    if (nextProps.videoDir &&
      nextProps.video &&
      this.mpv &&
      this.props.video !== nextProps.video
    ) {
        this.mpv.command("loadfile", path.join(config.ftp.macMount, nextProps.videoDir, nextProps.video));
    }
  }
  render() {
    const {
      labels,
      labelsAt,
      editLabels,
      isLoadingVideo,
      isLoadingVideoDir,
      video,
      videoDir,
    } = this.props;
    return (
      <div
        className={s.container}
        ref={(input) => { this.container = input; }}
      >
        <ReactMPV
          className={s.player}
          onReady={this.handleMPVReady}
          onPropertyChange={this.handlePropertyChange}
          onMouseDown={this.togglePause}
        />
        <div className={s.controls}>
          <button className={s.control} onClick={this.togglePause}>
            {this.state.pause ?
              <span className={cx(p['icon'], p['icon-play'])}></span> :
              <span className={cx(p['icon'], p['icon-pause'])}></span>}
          </button>
          {/* <button className={s.control} onClick={this.handleStop}>
              <span className={cx(p['icon'], p['icon-stop'])}></span>
          </button> */}
          <div className={cx(s.control, s.time)}>
            {`${parseInt(this.state['time-pos'])} / ${parseInt(this.state['duration'])}`}
          </div>
          <input
            className={s.seek}
            type="range"
            min={0}
            step={0.1}
            max={this.state.duration}
            value={this.state["time-pos"]}
            onChange={this.handleSeek}
            onMouseDown={this.handleSeekMouseDown}
            onMouseUp={this.handleSeekMouseUp}
          />
          {/* <button className={s.control} onClick={this.handleLoad}>
            <span className={cx(p['icon'], p['icon-video'])}></span>
          </button> */}
          <button
            className={labels.range[1] === -1 || labels.range[1] > this.state['time-pos']? s.control: cx(s.control, s.disabled)}
            disabled={!(labels.range[1] === -1 || labels.range[1] > this.state['time-pos'])}
            onClick={e => {
              const newValue = parseFloat(Number(this.state['time-pos']).toFixed(3));
              const newLabels = { range: [newValue, labels.range[1]] };
              editLabels({...labels, ...newLabels}, labelsAt);
            }}
          >
            <span className={cx(p['icon'], p['icon-left-open'])}></span>
          </button>
          <button
            className={labels.range[0] === 0 || this.state['time-pos'] > labels.range[0]? s.control: cx(s.control, s.disabled)}
            disabled={!(labels.range[0] === 0 || this.state['time-pos'] > labels.range[0])}
            onClick={e => {
              const newValue = parseFloat(Number(this.state['time-pos']).toFixed(3));
              const newLabels = { range: [labels.range[0], newValue] };
              editLabels({...labels,...newLabels}, labelsAt);
            }}
          >
            <span className={cx(p['icon'], p['icon-right-open'])}></span>
          </button>
        </div>
      </div>
    );
  }
}
