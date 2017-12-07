// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Home.css';
import p from '../photon/dist/css/photon.css';
import Player from './Player';
import Detail from './Detail';
import List from './List';
import cx from 'classnames';
import FTPClient from 'ftp';
import config from '../config';

const client = new FTPClient;
const getDirsTab = (rt) => new Promise((resolve, reject) => {
  client.on('ready', () => {
    client.list(parent, (err, dirs) => {
      if (err) reject(err);
      const onlyDirs = dirs.filter((dir) => dir.type === 'd');
      const data = onlyDirs.map(dir => ({ name: dir.name }));
      resolve(data);
    });
    client.end();
  });
  client.on('error', err => reject(err));
  client.connect({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.pass,
    keepalive: 999999999,
  });
});

export default class Home extends Component {
  constructor(props){
      super(props);
      this.state = {
        isLoading: false,
        selectTabs: null,
        selectTab: '',
        selectDir: '',
      };
  }

  onSelectTab = (e) => {
    this.setState({ selectTab: e.target.innerHTML})
  }

  onSelectDir = (e) => {
    let name = e.target.innerHTML;
    // 如果点击到icon上，寻找icon的text
    if (!name) {
      name = e.target.parentNode.childNodes[1].innerHTML;
    }
    // 如果点击到button上，寻找button到text
    if (name.length > 10) {
      console.log(e.target.childNodes);
      name = e.target.childNodes[1].innerHTML;
    }
    this.setState({ selectDir: name });
  }

  render() {
    const { selectTabs, selectDir, selectTab } = this.state;
    return (
      <div className={p['window']}>
        <header className={cx(p['toolbar'], p['toolbar-header'])} onClick={this.onSelectDir}>
          <div className={p['toolbar-actions']}>
            <button className={cx(p['btn'], p['btn-default'])}>
              <span className={cx(p['icon'], p['icon-folder'], p['icon-text'])}></span>
              <span className={selectDir === 'ddpai'? s['active']: ''}>ddpai</span>
            </button>
            <button className={cx(p['btn'], p['btn-default'])}>
              <span className={cx(p['icon'], p['icon-folder'], p['icon-text'])}></span>
              <span className={selectDir === 's360'? s['active']: ''}>s360</span>
            </button>
            <button className={cx(p['btn'], p['btn-default'])}>
              <span className={cx(p['icon'], p['icon-folder'], p['icon-text'])}></span>
              <span className={selectDir === 'goluk'? s['active']: ''}>goluk</span>
            </button>
            <button className={cx(p['btn'], p['btn-default'])}>
              <span className={cx(p['icon'], p['icon-folder'], p['icon-text'])}></span>
              <span className={selectDir === 'gopro'? s['active']: ''}>gopro</span>
            </button>
            <button className={cx(p['btn'], p['btn-default'])}>
              <span className={cx(p['icon'], p['icon-folder'], p['icon-text'])}></span>
              <span className={selectDir === 'jado'? s['active']: ''}>jado</span>
            </button>
          </div>
        </header>
        <div className={p['tab-group']}>
          <div className={p['tab-item']}>
            <span className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}></span>
            Tab
          </div>
          <div className={cx(p['tab-item'], p['active'])}>
            <span className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}></span>
            Tab Active
          </div>
          <div className={p['tab-item']}>
            <span className={cx(p['icon'], p['icon-cancel'], p['icon-close-tab'])}></span>
            Tab
          </div>
          <div className={cx(p['tab-item'], p['tab-item-fixed'])}>
            <span className={cx(p['icon'], p['icon-plus'])}></span>
          </div>
        </div>
        <div className={p['window-content']} data-tid="container">
          <div className={p['pane-group']}>
            <div className={cx(p['pane-sm'], p['sidebar'], p['padded-bottom-more'])}>
              <List />
            </div>
            <div className={p['pane']}>
              <Player />
            </div>
            <div className={cx(p['pane-sm'], p['sidebar'])}>
              <Detail />
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
