import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import CommitGraph from './components/commitGraph';

import simpleGit, {SimpleGit} from 'simple-git';

import './App.global.css';

const git: SimpleGit = simpleGit('/Users/oliver/Documents/Programming/githubClones/gitTest', { binary: 'git' });

type myState = {
  commits: any,
  current: string,
  commitGraphWidth: number,
  commitGraphHeight: number
}

class Hello extends React.Component<{}, myState> {

  componentWillMount() {

    this.setState({commits: [], current: '', commitGraphWidth: window.innerWidth, commitGraphHeight: window.innerHeight-200})
    window.addEventListener('resize', () => {this.setState({commitGraphWidth: window.innerWidth, commitGraphHeight: window.innerHeight-200})})

    // get current branch
    git.status()
      .then((res:any) => {this.setState({current: res.current})});
    
    // get all commits
    git.log({'--all': null, format: {commitHash: '%H', commitName: '%s', authorName: '%an', authorDate: '%ad', parentHashes: '%P'}})
      .then((res:any) => {console.log(res); this.setState({commits: res.all})});
    
  }

  render() {
    return(
    <div className="all">
      <div className="header">
        <h1>Gitty</h1>
      </div>
      <p>Current branch : {this.state.current}</p>
      <CommitGraph commits={this.state.commits} width={this.state.commitGraphWidth} height={this.state.commitGraphHeight}></CommitGraph>
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
