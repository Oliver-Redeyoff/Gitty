import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import CommitGraph from './components/commitGraph';

import simpleGit, {SimpleGit} from 'simple-git';

import './App.global.css';

const git: SimpleGit = simpleGit('/Users/oliver/Documents/Programming/githubClones/gitTest', { binary: 'git' });

const Main = () => {

  // commit graph container ref
  const canvasContainerRef = useRef(null);
  const [commits, setCommits] = useState([]);
  const [commitGraphContainerSize, setCommitGraphContainerSize] = useState({width: 0, height: 0});

  useEffect(() => {

    setCommitGraphContainerSize((currentSize) => {
      let newCommitGraphContainerSize = {...currentSize};
      newCommitGraphContainerSize.width = canvasContainerRef.current.innerWidth;
      newCommitGraphContainerSize.height = canvasContainerRef.current.innerHeight;
      console.log(newCommitGraphContainerSize)
      return newCommitGraphContainerSize;
    })

    window.addEventListener('resize', () => {
      setCommitGraphContainerSize((currentSize) => {
        let newCommitGraphContainerSize = {...currentSize};
        newCommitGraphContainerSize.width = canvasContainerRef.current.clientWidth;
        newCommitGraphContainerSize.height = canvasContainerRef.current.clientHeight;
        console.log(newCommitGraphContainerSize)
        return newCommitGraphContainerSize;
      })
    })

    // get current branch
    // git.status()
    //   .then((res:any) => {this.setState({current: res.current})});
    
    // get all commits
    git.log({'--all': null, format: {commitHash: '%H', commitName: '%s', authorName: '%an', authorDate: '%ad', parentHashes: '%P', refNames: '%d'}})
      .then((res:any) => {console.log(res); setCommits(res.all)});
    
  }, []);

  useEffect(() => {
    console.log(canvasContainerRef)
    setCommitGraphContainerSize((currentSize) => {
      let newCommitGraphContainerSize = {...currentSize};
      newCommitGraphContainerSize.width = canvasContainerRef.current.clientWidth;
      newCommitGraphContainerSize.height = canvasContainerRef.current.clientHeight;
      console.log(newCommitGraphContainerSize)
      return newCommitGraphContainerSize;
    })
  }, [commits, canvasContainerRef])


  return(
    <>
      <div className="header">
        <h1>Gitty</h1>
      </div>
      <div className="all">

        <div className="sidebarContainer">
          <div className="sidebar">
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
            <div className="sidebar-slot"><img src="https://img.icons8.com/material-outlined/24/000000/merge-git.png"/></div>
          </div>
        </div>

        <div className="contentContainer">
          <div ref={canvasContainerRef} className="commitGraphContainer">
            <CommitGraph commits={commits} width={commitGraphContainerSize.width} height={commitGraphContainerSize.height}></CommitGraph>
          </div>
        </div>
      </div>
    </>
  );
  
};

export default function App() {
  return (
    <div>
      <div className="frame-drag-area"></div>
      <Router>
        <Switch>
          <Route path="/" component={Main} />
        </Switch>
      </Router>
    </div>
  );
}
