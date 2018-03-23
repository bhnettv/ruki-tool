import fs from 'fs';
import path from 'path';
import os from 'os';

let userPath = os.homedir();

const setUserPath = (p) => {
  userPath = p;
  // console.log('write user path:', userPath);
};

const getUserPath = () => {
  // console.log('read user path:', userPath);
  return userPath;
};

const getMediaPath = () => {
  let mediaPath = os.homedir();
  if (fs.existsSync(path.join(os.homedir(), 'ruki.txt'))) {
    mediaPath = fs.readFileSync(path.join(os.homedir(), 'ruki.txt'), { encoding: 'utf8' });
  }
  // console.log('read media path:', mediaPath);
  return mediaPath;
};

const setMediaPath = (mediaPath) => {
  try {
    // console.log('write media path:', mediaPath);
    fs.writeFileSync(path.join(os.homedir(), 'ruki.txt'), mediaPath, { encoding: 'utf8' });
  } catch (e) {
    console.log(e);
  }
};

export default { getMediaPath, setMediaPath, setUserPath, getUserPath };
