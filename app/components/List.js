// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './List.css';
import p from '../photon/dist/css/photon.css';
import cx from 'classnames';
import { Treebeard } from 'react-treebeard';
import FTPClient from 'ftp';
import path from 'path';
import config from '../config';

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
  const client = new FTPClient;
  client.on('ready', async () => {
    const data = {
      name: rt,
      toggled: true,
      children: await listDirs('/home/ruki_videos/ddpai_1'),
    };
    console.log(data);
    resolve(data);
    client.end();
  });
  client.connect({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.pass,
    keepalive: 999999999,
  });
});


const data = {
    name: 'root',
    toggled: true,
    children: [
        {
            name: 'parent',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'loading parent',
            loading: true,
            children: []
        },
        {
            name: 'parent',
            children: [
                {
                    name: 'nested parent',
                    children: [
                        { name: 'nested child 1' },
                        { name: 'nested child 2' }
                    ]
                }
            ]
        }
    ]
};

class List extends Component {
  constructor(props){
      super(props);
      this.state = {
        cursor: null,
        isLoading: false,
        data: [],
      };
  }

  componentDidMount () {

  }

  onToggle = (node, toggled) => {
      if(this.state.cursor){this.state.cursor.active = false;}
      node.active = true;
      if(node.children){ node.toggled = toggled; }
      this.setState({ cursor: node });
  };

  render() {
    return (
      <div className={s['container']}>
        <Treebeard
          data={data}
          onToggle={this.onToggle}
        />
      </div>
    );
  }
}

export default List;
