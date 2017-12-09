// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import type { counterStateType } from '../reducers/counter';

const history = createBrowserHistory();
type initialStateType = homeStateType | counterStateType;
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: initialStateType) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
