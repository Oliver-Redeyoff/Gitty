import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import simpleGit, {SimpleGit} from 'simple-git';

import icon from '../assets/icon.svg';
import './App.global.css';

const git: SimpleGit = simpleGit('/Users/oliver/Documents/Programming/githubClones/Gitty', { binary: 'git' });

type myState = {
  current: string
}

class Hello extends React.Component<{}, myState> {

  componentWillMount() {
    this.setState({current: ''})
    git.status()
      .then((res:any) => {this.setState({current: res.current})});
  }

  render() {
    return(
    <div>
      <div className="header">
        <h1>Gitty</h1>
      </div>
      <p>Current branch : {this.state.current}</p>
    </div>
    );
  }
};

export default function App() {
  return (
    <div>
      <div className="frame-drag-area"></div>
      <Router>
        <Switch>
          <Route path="/" component={Hello} />
        </Switch>
      </Router>
    </div>
  );
}
