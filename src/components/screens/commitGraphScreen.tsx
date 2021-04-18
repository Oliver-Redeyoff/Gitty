import React, { useEffect, useRef, useState } from 'react';
import CommitTooltip from '../tools/commitTooltip';

interface CanvasProps {
  commits: any;
  width: number;
  height: number;
  theme: any;
}

const commitGraphScreen = (props: CanvasProps) => {

  // store globalId for requestanimationFrames
  var animationRequestFrameId: number;

  // reference for the canvas dom element
  const canvasRef = useRef(null);

  // processed commits
  const [processedCommits, setProcessedCommits] = useState({});

  // canvas is a grid divided into tiles
  const grid = useRef([{}]);
  const [tileSize, setTileSize] = useState({width: 30, height: 30});
  const tileSizeLimits = {minWidth: 10, maxWidth: 100, minHeight: 10, maxHeight: 100};
  const [gridOffset, setGridOffset] = useState({x: 0, y: 0});

  // list of top level elements
  var leaf_nodes: any;

  // stores x and y pos of mouse when dragging
  let x: number = 0;
  let y: number = 0;

  // stores x and y pos of tooltip in state
  const [tooltipData, setTooltipData] = useState({visible: false, x: 0, y: 0, hash: '', author: '', date: ''});


  //////////////////
  // Reload logic //
  //////////////////
  useEffect(() => { 

    if (!canvasRef.current) {
      return undefined;
    }

    const canvas: HTMLCanvasElement = canvasRef.current!;
    canvas.addEventListener('wheel', function(e){ 

      setTileSize((currentTileSize) => {
        let newTileSize = {...currentTileSize};
        newTileSize.width += Math.round(e.deltaY/2);
        if (newTileSize.width < tileSizeLimits.minWidth) newTileSize.width = tileSizeLimits.minWidth; 
        if (newTileSize.width > tileSizeLimits.maxWidth) newTileSize.width = tileSizeLimits.maxWidth;

        newTileSize.height += Math.round(e.deltaY/2);
        if (newTileSize.height < tileSizeLimits.minHeight) newTileSize.height = tileSizeLimits.minHeight;
        if (newTileSize.height > tileSizeLimits.maxHeight) newTileSize.height = tileSizeLimits.maxHeight;

        return(newTileSize);
      })

    })

    canvas.addEventListener('mousedown', mouseDownHandler);

  }, []);

  useEffect(() => {
    //console.log('commits updated');
    if (!canvasRef.current) {
      return undefined;
    }

    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // get commits from props
    let commits: any = processCommits(props.commits);
    setProcessedCommits(commits);

    // set first commit
    var firstCommitHash = leaf_nodes[0];

    // add commits recursively to grid
    grid.current = [{}];
    populateGridRec(firstCommitHash, commits, ctx, 0, 0);

    cancelAnimationFrame(animationRequestFrameId);
    animationRequestFrameId = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGraph(ctx);
    });

  }, [props.commits]);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    cancelAnimationFrame(animationRequestFrameId);

    // add event handler for hover over commits
    canvas.addEventListener('mousemove', mouseMoveHandler2);

    // redraw grid
    animationRequestFrameId = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGraph(ctx);
    });

    return() => canvas.removeEventListener('mousemove', mouseMoveHandler2);
  }, [props.width, props.height, tileSize, gridOffset]);


  ///////////////////
  // Zoom and drag //
  ///////////////////
  const mouseDownHandler = function(e: any) {
    x = e.clientX;
    y = e.clientY;
    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  const mouseMoveHandler = function(e: any) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    x = e.clientX;
    y = e.clientY;
    setGridOffset((currentGridOffset) => {
      let newGridOffset = {...currentGridOffset};
      newGridOffset.x -= dx;
      if(newGridOffset.x < -30) newGridOffset.x = -30;
      newGridOffset.y -= dy;
      if (newGridOffset.y < -30) newGridOffset.y = -30;
      return newGridOffset;
    })
  }

  const mouseUpHandler = function() {
    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    setGridOffset((currentGridOffset) => {
      if(currentGridOffset.x < 0 || currentGridOffset.y < 0) {
        bounceBack();
      }
      return currentGridOffset;
    })
  };

  const bounceBack = function() {
    let stillBouncing = false;
    setGridOffset((currentGridOffset) => {
      let newGridOffset = {...currentGridOffset}
      if(newGridOffset.x < 0 && newGridOffset.y < 0) {
        stillBouncing = true;
        newGridOffset.x += 1;
        newGridOffset.y += 1;
      }
      else if (newGridOffset.x < 0) {
        stillBouncing = true;
        newGridOffset.x += 1;
      }
      else if (newGridOffset.y < 0) {
        stillBouncing = true;
        newGridOffset.y += 1;
      }
      if (stillBouncing) {
        setTimeout(bounceBack, 5);
      }
      return newGridOffset;
    })
  }


  ///////////////////////////////////////
  // Process commits and populate grid //
  ///////////////////////////////////////
  function processCommits(commits: any) {

    leaf_nodes = [];
    let commitsProcessed: any = {};
    
    // first add all commits to object with parent hashes as array
    commits.forEach((commit: any) => {

      // add this commit as a child com
      let parents = commit.parentHashes.split(" ");
      parents.forEach((parent: any) => {
        if(parent.length < 5) {
          let index = parents.indexOf(parent);
          if (index > -1) {
            parents.splice(index, 1);
          }
        }
      });

      commitsProcessed[commit.commitHash] = {
        authorName: commit.authorName,
        authorDate: commit.authorDate,
        parentCommits: parents,
        childCommits: [],
        visited: false
      };

    });

    // now work out the child hashes for each commit
    Object.keys(commitsProcessed).forEach(function(key) {
      
      commitsProcessed[key].parentCommits.forEach((parent: any) => {
        
        if(commitsProcessed[parent]) {
          commitsProcessed[parent].childCommits.push(key);
        }
      });

    });

    // now one last pass to get the leaf nodes
    Object.keys(commitsProcessed).forEach(function(key) {
      if (commitsProcessed[key].childCommits.length == 0) {
        leaf_nodes.push(key);
      }
    });

    return commitsProcessed;
    
  }
  
  function populateGridRec(currentCommitHash: string, commits: any, ctx: CanvasRenderingContext2D, x: number, y: number) {

    if(commits[currentCommitHash]) {
      
      // get parent commits
      let parentCommits = commits[currentCommitHash].parentCommits;

      // add commit to grid if it hasn't been visited yet
      if(commits[currentCommitHash].visited == false) {
        addToGrid(currentCommitHash, x, y, commits[currentCommitHash].authorName, parentCommits);
        // mark commit as visited so that we don't draw commits twice
        commits[currentCommitHash].visited = true;
      }

      // if no more parents, stop
      if(parentCommits.length == 0) {
        return;
      }

      // if one parent, draw next commit with an incremented x
      else if(parentCommits.length == 1) {
        // stop if the next commit has already been visited
        if(commits[parentCommits[0]]) {
          if(commits[parentCommits[0]].visited == true){
            return;
          }
        }
        populateGridRec(parentCommits[0], commits, ctx, x, y+1);
      }

      // if there are multiple parents, draw from left to right
      else if(parentCommits.length >= 2) {
        let branchCount = 0;
        parentCommits.forEach((parentCommit: any) => {
          // first branch stays in the same x
          if(branchCount == 0) {
            populateGridRec(parentCommit, commits, ctx, x, y+1);
          } else {
            // need to find what x we can start at
            let nextX = findFreeX(y);
            
            populateGridRec(parentCommit, commits, ctx, nextX, y+1);
          }
          branchCount += 1;
        });
      }
    }
  }

  function addToGrid(hash: string, x: number, y: number, author: string, parentHashes: any) {
    // if this y doesn't exist in the grid yet, add all missing rows to grid
    if(y > grid.current.length-1) {
      let limit = grid.current.length;
      for(var i=0 ; i<=(y-limit) ; i++) {
        grid.current.push({});
      }
    }

    // try and add commit to grid
    if(!grid.current[y].hasOwnProperty(x)) {
      grid.current[y][x] = {hash: hash, parentHashes: parentHashes, author: author};
    } else {
      throw 'Grid position is already taken';
    }

  }

  function findFreeX(y: number) {
    // if this row doesn't exist yet, then take the first column
    if(y > grid.current.length-1) {
      return 0;
    } else {
      let xCoords = Object.keys(grid.current[y]).map((x) => {return parseInt(x, 10)});
      return Math.max(...xCoords)+1;
    }
  }


  ///////////////////////
  // Draw commit graph //
  ///////////////////////
  function drawGraph(ctx: CanvasRenderingContext2D) {

    // now draw commits that are within bounds of canvas
    // first get min/max x/y that are within bounds
    let min_x = gridOffset.x>=0 ? Math.floor(gridOffset.x / tileSize.width) : 0;
    let max_x = Math.ceil((props.width+gridOffset.x) / tileSize.width);

    let min_y = gridOffset.y>=0 ? Math.floor(gridOffset.y / tileSize.height) : 0;
    let max_y = Math.ceil((props.height+gridOffset.y) / tileSize.height);

    // look at visible commit row by row and draw from this line to the next line
    grid.current.slice(min_y, max_y).forEach(row => {
      
      for(var colStr in row) {
        let col = parseInt(colStr, 10);
        if(col >= min_x && col <= max_x) {
          // get real pos of current commit
          let currentCommitPos = getCommitPos(row[colStr].hash);

          // get parent commits and draw lines to them
          let parentCommits = row[colStr].parentHashes;
          parentCommits.forEach(parent => {
            let parentPos = getCommitPos(parent);
            if(parentPos.x != null) {
              drawCommitLink(ctx, currentCommitPos.x, currentCommitPos.y, parentPos.x, parentPos.y);
            }
          });

        }
      }
    });

    // draw the visible grid
    grid.current.slice(min_y, max_y).forEach(row => {
      for(var colStr in row) {
        let col = parseInt(colStr, 10);
        if(col >= min_x && col <= max_x) {
          // get real pos of commit
          let realPos = getCommitPos(row[colStr].hash);
          drawCommit(ctx, realPos.x, realPos.y, row[colStr].author);
        }
      }
    });

  }

  function drawCommit(ctx: CanvasRenderingContext2D, x: number, y: number, author: string) {

    // draw circle to represent commit
    ctx.beginPath();
    ctx.arc(x + tileSize.width/2, y + tileSize.height/2, tileSize.height*0.4, 0, 2 * Math.PI);
    ctx.fillStyle = props.theme.content_commit_bg_color;
    ctx.fill();

    let fontSize = tileSize.width*0.25;
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = props.theme.content_commit_text_color;
    ctx.textAlign = "center";

    // get authors initials
    let authorInitials = ''
    author.split(' ').forEach((name: string) => {
      authorInitials += name.charAt(0);
    })
    let textHeight = ctx.measureText(authorInitials).actualBoundingBoxAscent + ctx.measureText(authorInitials).actualBoundingBoxDescent;
    ctx.fillText(authorInitials, x + tileSize.width/2, y + tileSize.height/2 + textHeight/2);

    // draw grid
    // ctx.rect(real_x, real_y, tileSize.width, tileSize.height);
    // ctx.stroke()
  }

  function getCommitPos(hash: string) {

    let x = null;
    let y = null;

    let rowCounter = 0;
    grid.current.forEach(row => {
      for(var colStr in row) {
        if(row[colStr].hash == hash) {
          let col = parseInt(colStr);
          x = col*tileSize.width - gridOffset.x + 20;
          y = rowCounter*tileSize.height - gridOffset.y + 20;
        }
      }
      rowCounter += 1;
    });
    
    return({x: x, y: y});
  }

  function drawCommitLink(ctx: CanvasRenderingContext2D, xStart: number, yStart: number, xEnd: number, yEnd: number) {

    ctx.beginPath();
    ctx.moveTo(xStart + tileSize.width/2, yStart + tileSize.height/2);
    ctx.lineTo(xEnd + tileSize.width/2, yEnd + tileSize.height/2);
    ctx.strokeStyle = props.theme.content_commit_link_color;
    ctx.stroke();

  }

  
  ////////////////////
  // Commit tooltip //
  ////////////////////
  const mouseMoveHandler2 = function(e: any) {

    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    
    // look at each commit and see if it overlaps
    let hit = false;
    grid.current.forEach(row => {
      for(var col in row) {

        let realPos = getCommitPos(row[col].hash);

        if(x >= realPos.x && x <= (realPos.x + tileSize.width)
        && y >= realPos.y && y <= (realPos.y + tileSize.height)) {
          hit = true;
          setProcessedCommits((processedCommits) => {
            let currentCommit = processedCommits[row[col].hash];
            setTooltipData({visible: true, x: e.pageX, y: e.pageY, hash: row[col].hash, author: currentCommit.authorName, date: currentCommit.authorDate});
            return processedCommits;
          })
        }
      }
    });

    if(!hit) {
      setTooltipData({visible: false, x: 0, y: 0, hash: '', author: '', date: ''});
    }

  }

  
  ////////////////
  // DOM render //
  ////////////////
  return (
    <div>
      <canvas ref={canvasRef} width={props.width} height={props.height}/>
      {tooltipData.visible ? <CommitTooltip hash={tooltipData.hash} x={tooltipData.x} y={tooltipData.y} author={tooltipData.author} date={tooltipData.date}/> : ''}
    </div>
  );
}

export default commitGraphScreen;