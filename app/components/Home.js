// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './Home.css';
import p from '../photon/dist/css/photon.css';
import Player from './Player';
import Detail from './Detail';
import cx from 'classnames';

export default class Home extends Component {
  render() {
    return (
      <div className={p['window']}>
        {/* <header className={cx(p['toolbar'], p['toolbar-header'])}>
          <div className={p['toolbar-actions']}>
            <button className={cx(p['btn'], p['btn-default'], p['btn-dropdown'])}>
              <span className={cx(p['icon'], p['icon-home'], p['icon-text'])}></span>
              <span className={cx(p['icon'], p['icon-megaphone'])></span>
            </button>
          </div>
        </header> */}
        <div className={p['window-content']} data-tid="container">
          <div className={p['pane-group']}>
            <div className={cx(p['pane-sm'], p['sidebar'])}></div>
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
