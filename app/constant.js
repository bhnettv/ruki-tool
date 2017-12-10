/**
 # MIT License
 #
 # Copyright (c) 2017 Zeu Fung
 #
 # Permission is hereby granted, free of charge, to any person obtaining a copy
 # of this software and associated documentation files (the "Software"), to deal
 # in the Software without restriction, including without limitation the rights
 # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 # copies of the Software, and to permit persons to whom the Software is
 # furnished to do so, subject to the following conditions:
 #
 # The above copyright notice and this permission notice shall be included in all
 # copies or substantial portions of the Software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 # SOFTWARE.
 */

const LABELS_AT = [
  { value: 'ungroup', name: '未分类' },
  { value: 'nogroup', name: '无分类' },
  { value: 'crashme', name: '视频车事故' },
  { value: 'crashit', name: '非视频车事故' },
  { value: 'nocrash', name: '无事故' },
];

const CRASHES = [
  { value: '对撞', name: '碰撞角度在180与135度之间', group: 0 },
  { value: '角撞', name: '碰撞角度在135与45度之间', group: 0 },
  { value: '侧撞', name: '碰撞角度在45与0度之间', group: 0 },
  { value: '追撞', name: '碰撞角度几近于0度', group: 0 },
  { value: '撞机动车', name: '与机动车发生碰撞', group: 1 },
  { value: '撞非机动车', name: '与非机动车发生碰撞', group: 1 },
  { value: '撞行人', name: '与行人发生碰撞', group: 1 },
  { value: '撞固定物', name: '与固定障碍物发生碰撞', group: 1 },
  { value: '目击现场', name: '第一视角的碰撞', group: 2 },
  { value: '亲身经历', name: '第三视角的碰撞', group: 2 },
  { value: '其他事故', name: '其他交通事故', group: 3 },
];

const RULES = [
  { value: '未悬挂或遮挡车牌', name: '未悬挂或遮挡车牌', group: 0 },
  { value: '实线变道', name: '实线变道', group: 1 },
  { value: '占用公交专用道', name: '占用公交专用道', group: 2 },
  { value: '货车占用客车道', name: '货车占用客车道', group: 3 },
  { value: '占用应急车道', name: '占用应急车道', group: 4 },
  { value: '闯红黄灯', name: '闯红黄灯', group: 5 },
  { value: '逆向行驶', name: '逆向行驶', group: 6 },
  { value: '不在机动车道内行驶', name: '不在机动车道内行驶', group: 7 },
  { value: '不按导向车道行驶', name: '不按导向车道行驶', group: 8 },
  { value: '占用对面车道', name: '占用对面车道', group: 9 },
  { value: '违停', name: '违停', group: 10 },
  { value: '人行道不减速停车避让行人', name: '人行道不减速停车避让行人', group: 11 },
  { value: '肇事逃逸', name: '肇事逃逸', group: 12 },
  { value: '滥用远光灯', name: '滥用远光灯', group: 13 },
  { value: '其他违章', name: '其他违章行为', group: 14 },
];

const KEYWORDS = [
  { value: '动物世界', name: '动物世界', group: 0 },
  { value: '奇葩行人', name: '奇葩行人', group: 1 },
  { value: '国家地理', name: '国家地理', group: 2 },
  { value: '千钧一发', name: '千钧一发', group: 3 },
  { value: '闪电雷鸣', name: '闪电雷鸣', group: 4 },
  { value: '烟花虽美', name: '烟花虽美', group: 5 },
  { value: '其他亮点', name: '其他亮点', group: 6 },
];

const CRASH_NAME_MAX_LENGTH = 20;

const CRASH_NAME_MIN_LENGTH = 2;

const RULE_NAME_MAX_LENGTH = 20;

const RULE_NAME_MIN_LENGTH = 2;

const POST_TITLE_MAX_LENGTH = 50;

const POST_TITLE_MIN_LENGTH = 2;

const COMMENT_TEXT_MAX_LENGTH = 2;

const COMMENT_TEXT_MIN_LENGTH = 2;

const KEYWORD_NAME_MAX_LENGTH = 5;

const KEYWORD_NAME_MIN_LENGTH = 2;

const USER_PASSWORD_MAX_LENGTH = 30;

const USER_PASSWORD_MIN_LENGTH = 8;

const USER_NAME_MAX_LENGTH = 10;

const USER_NAME_MIN_LENGTH = 1;

const USER_CODE_LENGTH = 8;

const PLATE_REGION = [
  '京',
  '津',
  '冀',
  '晋',
  '蒙',
  '辽',
  '吉',
  '黑',
  '沪',
  '苏',
  '浙',
  '皖',
  '闽',
  '赣',
  '鲁',
  '豫',
  '鄂',
  '湘',
  '粤',
  '桂',
  '琼',
  '川',
  '贵',
  '云',
  '渝',
  '藏',
  '陕',
  '甘',
  '青',
  '宁',
  '新',
];

const PLATE_CITY = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const PLATE_SEQUENCE = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export {
  LABELS_AT,
  CRASHES,
  RULES,
  KEYWORDS,
  CRASH_NAME_MAX_LENGTH,
  CRASH_NAME_MIN_LENGTH,
  RULE_NAME_MAX_LENGTH,
  RULE_NAME_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
  KEYWORD_NAME_MAX_LENGTH,
  KEYWORD_NAME_MIN_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_CODE_LENGTH,
  PLATE_REGION,
  PLATE_CITY,
  PLATE_SEQUENCE,
};
