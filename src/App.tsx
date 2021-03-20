import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import simpleGit, {SimpleGit} from 'simple-git';
import CommitGraph from './components/commitGraph';
import './App.global.css';

import SettingsIcon from './components/icons/settingsIcon';

const git: SimpleGit = simpleGit('/Users/oliver/Documents/Programming/githubClones/gitTest', { binary: 'git' });
var themeManagerModule = require('./gittyThemes/themeManager');

const Main = () => {

  // theme state
  const [theme, setTheme] = useState<any>({});
  // commit graph container ref
  const canvasContainerRef = useRef(null);
  const [commits, setCommits] = useState([]);
  const [commitGraphContainerSize, setCommitGraphContainerSize] = useState({width: 0, height: 0});

  useEffect(() => {

    // get theme
    let themeManager = new themeManagerModule();
    themeManager.init()
      .then((theme: any) => {setGittyTheme(theme)});

    setCommitGraphContainerSize((currentSize) => {
      let newCommitGraphContainerSize = {...currentSize};
      newCommitGraphContainerSize.width = canvasContainerRef.current.innerWidth;
      newCommitGraphContainerSize.height = canvasContainerRef.current.innerHeight;
      return newCommitGraphContainerSize;
    })

    window.addEventListener('resize', () => {
      setCommitGraphContainerSize((currentSize) => {
        let newCommitGraphContainerSize = {...currentSize};
        newCommitGraphContainerSize.width = canvasContainerRef.current.clientWidth;
        newCommitGraphContainerSize.height = canvasContainerRef.current.clientHeight;
        return newCommitGraphContainerSize;
      })
    })

    // get current branch
    // git.status()
    //   .then((res:any) => {this.setState({current: res.current})});
    
    // get all commits
    git.log({'--all': null, format: {commitHash: '%H', commitName: '%s', authorName: '%an', authorDate: '%ad', parentHashes: '%P', refNames: '%d'}})
      .then((res:any) => {setCommits(res.all)});
    
  }, []);

  useEffect(() => {
    setCommitGraphContainerSize((currentSize) => {
      let newCommitGraphContainerSize = {...currentSize};
      newCommitGraphContainerSize.width = canvasContainerRef.current.clientWidth;
      newCommitGraphContainerSize.height = canvasContainerRef.current.clientHeight;
      return newCommitGraphContainerSize;
    })
  }, [commits, canvasContainerRef])


  const setGittyTheme = function(theme) {
    console.log(theme)
    let root = document.documentElement;
    root.style.setProperty('--page-bg-color', theme.page_bg);
    root.style.setProperty('--header-bg-color', theme.header_bg);
    root.style.setProperty('--header-title-color', theme.header_title);
    root.style.setProperty('--sidebar-bg-color', theme.sidebar_bg);
    root.style.setProperty('--sidebar-item-color', theme.sidebar_item);
    root.style.setProperty('--sidebar-item-bg-color', theme.sidebar_item_bg);
    root.style.setProperty('--content-bg-color', theme.content_bg);
  }


  return(
    <>
      <div className="header" style={{'backgroundColor': theme.header_bg}}>
        <h1>Gitty</h1>
      </div>
      <div className="all">

        <div className="sidebarContainer">
          <div className="sidebar">
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
            <div className="sidebar-slot"><SettingsIcon></SettingsIcon></div>
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
