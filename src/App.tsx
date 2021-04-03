import React, { useEffect, useRef, useState } from 'react';
const remote = require("electron").remote;
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import simpleGit, {SimpleGit} from 'simple-git';
import CommitGraph from './components/commitGraph';
import './App.global.css';

import SettingsIcon from './components/icons/settingsIcon';
import FolderIcon from './components/icons/folderIcon';

const themeManagerModule = require('./gittyThemes/themeManager');

const Main = () => {

  // commit graph container ref
  const canvasContainerRef = useRef(null);
  const [commits, setCommits] = useState([]);
  const [currentRepo, setCurrentRepo] = useState("");
  const [commitGraphContainerSize, setCommitGraphContainerSize] = useState({width: 0, height: 0});

  useEffect(() => {

    let abortController = new AbortController();
    let signal = abortController.signal;

    // get theme
    let themeManager = new themeManagerModule();
    themeManager.init(signal)
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

    return (abortController.abort);

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


  const setGittyTheme = function(theme) {
    if (document != null) {
      let root = document.documentElement;
      root.style.setProperty('--page-bg-color', theme.page_bg_color);

      root.style.setProperty('--header-height', theme.header_height);
      root.style.setProperty('--header-bg-color', theme.header_bg_color);

      root.style.setProperty('--header-title-color', theme.header_title_color);
      root.style.setProperty('--header-title-bottom-border-color', theme.header_title_bottom_border_color);
      root.style.setProperty('--header-bottom-border-color', theme.header_bottom_border_color);

      root.style.setProperty('--sidebar-bg-color', theme.sidebar_bg_color);
      root.style.setProperty('--sidebar-border-color', theme.sidebar_border_color);
      root.style.setProperty('--sidebar-item-color', theme.sidebar_item_color);
      root.style.setProperty('--sidebar-item-bg-color', theme.sidebar_item_bg_color);
      
      root.style.setProperty('--content-bg-color', theme.content_bg_color);
      root.style.setProperty('--content-border-color', theme.content_border_color);
    }
  }

  const openRepoFinder = function() {
    remote.dialog.showOpenDialog({properties: ['openDirectory'] }).then(function (response) {
      if (!response.canceled) {
        // need to check that the folder contains a .git folder

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
          }
        })

      } else {
        console.log("no file selected");
      }
    });
  }

  const getLastFolder = function(path: string) {
    let folders = path.split("/");
    return folders.pop();
  }


  return(
    <>

      <div className="header">
        <h1>Gitty</h1>
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
