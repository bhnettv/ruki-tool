// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './List.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import FTPClient from 'ftp';
import path from 'path';
import config from '../config';

const client = new FTPClient;
const listDirs = (parent) => new Promise((resolve, reject) => {
  client.list(parent, async (err, dirs) => {
    if (err) reject(err);
    for (let dir of dirs) {
      if (dir.type === 'd') {
        dir.children = await listDirs(path.join(parent, dir.name));
      }
    }
    const data = dirs.map(dir => ({ name: dir.name, children: dir.children }));
    resolve(data);
  });
});
const getDirsTree = (rt) => new Promise((resolve, reject) => {
  client.on('ready', async () => {
    const data = {
      name: rt,
      toggled: true,
      children: await listDirs(`/home/ruki_videos/${rt}`),
    };
    resolve(data);
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

export default class List extends Component {
  constructor(props){
      super(props);
      this.state = {
        isLoading: false,
        selectTree: null,
        selectName: '',
      };
  }

  componentDidMount () {
    this.setState({ isLoading: true });
    getDirsTree('ddpai/ddpai_t30_c1_l1').then((data) => {
      this.setState({ selectTree: data, isLoading: false });
    });
  }

  onSelect = (e) => {
    this.setState({ selectName: e.target.innerHTML})
  };

  render() {
    const { selectTree, isLoading, selectName } = this.state;
    return (
      <div className={s['container']}>
        {
          isLoading?
          (
            <div>加载中...</div>
          ):
          selectTree?
          (
            <table className={p['table-striped']}>
              <tbody onClick={this.onSelect}>
                {selectTree.children.map((child, i) => (
                  <tr
                    key={i}
                    className={child.name === selectName? s['active']: ''}
                  >
                    <td>{child.name}</td>
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
