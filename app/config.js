import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';

const getMediaPath = () => {
  const userDataPath = os.homedir();
//   const userDataPath = process.cwd();
  let mediaPath = os.homedir();
  if (fs.existsSync(path.join(userDataPath, 'ruki.txt'))) {
    mediaPath = fs.readFileSync(path.join(userDataPath, 'ruki.txt'), { encoding: 'utf8' });
  }
  return mediaPath;
};

const setMediaPath = (mediaPath) => {
  const userDataPath = os.homedir();
//   const userDataPath = process.cwd();
  fs.writeFileSync(path.join(userDataPath, 'ruki.txt'), mediaPath, { encoding: 'utf8' });
};

export default { getMediaPath, setMediaPath };
