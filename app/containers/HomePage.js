// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Home from '../components/Home';
import * as HomeActions from '../actions/home';

function mapStateToProps(state) {
  const {
    isLoadingVideo,
    isLoadingVideoDir,
    video,
    videoDir,
    videos,
    videoDirs,
    labels,
  } = state.home;
  return {
    isLoadingVideo,
    isLoadingVideoDir,
    video,
    videoDir,
    videos,
    videoDirs,
    labels,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(HomeActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
