import React, { useEffect, useRef, useState } from 'react';
const remote = require("electron").remote;
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import simpleGit, {SimpleGit} from 'simple-git';
import './styles/App.global.scss';

import CommitGraphScreen from './components/screens/commitGraphScreen';
import CommitHistoryScreen from './components/screens/commitHistoryScreen';
import FileDiffScreen from './components/screens/fileDiffScreen';
import BranchesScreen from './components/screens/branchesScreen';
import TerminalScreen from './components/screens/terminalScreen';
import SettingsScreen from './components/screens/settingsScreen';

import GittyIcon from './components/icons/gittyIcon';
import FolderIcon from './components/icons/folderIcon';

import GraphIcon from './components/icons/graphIcon';
import HistoryIcon from './components/icons/historyIcon';
import DifferenceIcon from './components/icons/differenceIcon';
import BranchesIcon from './components/icons/branchIcon';
import TerminalIcon from './components/icons/terminalIcon';
import SettingsIcon from './components/icons/settingsIcon';

const { getTheme, getConfig, setConfig } = require('./components/configManager');

const Main = () => {

  // commit graph container ref
  const canvasContainerRef = useRef(null);
  const [showCoverScreen, setShowCoverScreen] = useState(true);
  const [tab, setTab] = useState(0);
  const [notify, setNotify] = useState({trigger: 0, title: ""});

  const [commits, setCommits] = useState([]);
  const [currentRepo, setCurrentRepo] = useState("");
  const [theme, setTheme] = useState({});
  const [commitGraphContainerSize, setCommitGraphContainerSize] = useState({width: 0, height: 0});

  useEffect(() => {

    // get theme
    let config = getConfig();
    setCurrentRepo(config.repoPath ?? "");

    setGittyTheme(config["theme"], false);

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

    setTimeout(() => setShowCoverScreen(false), 500);

  }, []);

  useEffect(() => {
    if(currentRepo != "") {
      const git: SimpleGit = simpleGit(currentRepo, { binary: 'git' });

      // get current branch
      // git.status()
      //   .then((res:any) => {this.setState({current: res.current})});

      git.log({'--all': null, format: {commitHash: '%H', commitName: '%s', authorName: '%an', authorDate: '%ad', parentHashes: '%P', refNames: '%d'}})
        .then((res:any) => {setCommits(res.all)});
    }
  }, [currentRepo])

  useEffect(() => {
    setCommitGraphContainerSize((currentSize) => {
      let newCommitGraphContainerSize = {...currentSize};
      newCommitGraphContainerSize.width = canvasContainerRef.current.clientWidth;
      newCommitGraphContainerSize.height = canvasContainerRef.current.clientHeight;
      return newCommitGraphContainerSize;
    })
  }, [commits, canvasContainerRef])


  const setGittyTheme = function(themeName, notify=true) {

    let theme = getTheme(themeName);

    setConfig({"theme": themeName})

    setTheme(theme);

    if (document != null) {
      let root = document.documentElement;
      root.style.setProperty('--page-bg-color', theme.page_bg_color);

      root.style.setProperty('--notification-bg-color', theme.notification_bg_color);
      root.style.setProperty('--notification-text-color', theme.notification_text_color);
      root.style.setProperty('--notification-icon-color', theme.notification_icon_color);

      root.style.setProperty('--header-height', theme.header_height);
      root.style.setProperty('--header-bg-color', theme.header_bg_color);
      root.style.setProperty('--header-title-color', theme.header_title_color);
      root.style.setProperty('--header-title-bottom-border-color', theme.header_title_bottom_border_color);
      root.style.setProperty('--header-bottom-border-color', theme.header_bottom_border_color);
      root.style.setProperty('--header-repo-icon-color', theme.header_repo_icon_color);
      root.style.setProperty('--header-repo-text-color', theme.header_repo_text_color);
      root.style.setProperty('--header-repo-border-color', theme.header_repo_border_color);

      root.style.setProperty('--sidebar-bg-color', theme.sidebar_bg_color);
      root.style.setProperty('--sidebar-border-color', theme.sidebar_border_color);
      root.style.setProperty('--sidebar-item-color', theme.sidebar_item_color);
      root.style.setProperty('--sidebar-item-bg-color', theme.sidebar_item_bg_color);
      
      root.style.setProperty('--content-bg-color', theme.content_bg_color);
      root.style.setProperty('--content-border-color', theme.content_border_color);
      root.style.setProperty('--content-text-color', theme.content_text_color);
    }

    if(notify) {
      triggerNotification("Set theme to " + themeName);
    }

  }

  const renderTab = function() {
    switch(tab) {
      case 0:
        return (<CommitGraphScreen commits={commits} theme={theme} width={commitGraphContainerSize.width} height={commitGraphContainerSize.height}></CommitGraphScreen>)
      case 1:
        return (<CommitHistoryScreen></CommitHistoryScreen>)
      case 2:
        return (<FileDiffScreen></FileDiffScreen>)
      case 3:
        return (<BranchesScreen></BranchesScreen>)
      case 4:
        return (<TerminalScreen></TerminalScreen>)
      case 5:
        return (<SettingsScreen updateTheme={setGittyTheme}></SettingsScreen>)
      default:
        return (<h1>This shouldn't show, what are you doing here?</h1>)
    }
  }

  const openRepoFinder = function() {
    remote.dialog.showOpenDialog({properties: ['openDirectory'] }).then(function (response) {
      if (!response.canceled) {
        new Promise(resolve =>{
          const fs = require('fs');
          const dirPath = response.filePaths[0];
          let isRepo = false;
          fs.readdir(dirPath, (_, files) => {
              files.forEach(file => {
                if(file == '.git'){
                  isRepo = true;
                }
              });
              resolve(isRepo);
          });
        }).then((isRepo: boolean) => {
          if (isRepo) {
            setCurrentRepo(response.filePaths[0]);
            setConfig({"repoPath": response.filePaths[0]});
            triggerNotification("Updated repo path");
          }
        })

      }
    });
  }

  const getLastFolder = function(path: string) {
    let folders = path.split("/");
    return folders.pop();
  }

  const triggerNotification = function(title: string){
    setNotify({trigger: 1, title: title});
  }


  return(
    <>

      { showCoverScreen ? <div className="cover-screen">
        <GittyIcon></GittyIcon>
      </div> : <div className="fade-present"></div> }

      <div className="header">
        <h1 onClick={() => triggerNotification("Hello there")}>Gitty</h1>
        <div className="repoSelector" onClick={openRepoFinder}>
          <div className="leftCol">
            <FolderIcon></FolderIcon>
          </div>
          <div className="rightCol">
            <h2>{getLastFolder(currentRepo)}</h2>
          </div>
        </div>
      </div>

      <div className="all">
        <div className="sidebarContainer">
          <div className="sidebar">
            <div className={"sidebar-slot" + (tab==0 ? " active" : "")} onClick={() => setTab(0)}><GraphIcon></GraphIcon></div>
            <div className={"sidebar-slot" + (tab==1 ? " active" : "")} onClick={() => setTab(1)}><HistoryIcon></HistoryIcon></div>
            <div className={"sidebar-slot" + (tab==2 ? " active" : "")} onClick={() => setTab(2)}><DifferenceIcon></DifferenceIcon></div>
            <div className={"sidebar-slot" + (tab==3 ? " active" : "")} onClick={() => setTab(3)}><BranchesIcon></BranchesIcon></div>
            <div className={"sidebar-slot" + (tab==4 ? " active" : "")} onClick={() => setTab(4)}><TerminalIcon></TerminalIcon></div>
            <div className={"sidebar-slot" + (tab==5 ? " active" : "")} onClick={() => setTab(5)}><SettingsIcon></SettingsIcon></div>
          </div>
        </div>

        <div className="contentContainer">
          <div ref={canvasContainerRef} className="commitGraphContainer">
            {renderTab()}
          </div>
        </div>
      </div>

      {/* Notification element */}
      <div className={"notification-box" + (notify.trigger==1 ? " appear" : "")} onAnimationEnd={() => setNotify({...notify, trigger: 0})}>
        <div className="left">
          <GittyIcon></GittyIcon>
        </div>
        <div className="right">
          {notify.title}
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
