import { timeEnd } from 'console';
import React, { useEffect, useRef, useState, useCallback } from 'react'

interface CanvasProps {
  commits: [{authorDate: string, authorName: string, commitHash: string, parentHashes: any, refNames: any}];
  width: number;
  height: number;
}

const commitGraph = (props: CanvasProps) => {
  
  // store globalId for requestanimationFrames
  var animationRequestFrameId: number;
  // reference for the canvas dom element
  const canvasRef = useRef(null);
  // canvas is a grid divided into tiles
  const grid = useRef([]);
  const [tileSize, setTileSize] = useState({width: 15, height: 15});
  var grid_offset_x: number = -10;
  var grid_offset_y: number = -10;

  // list of top level elements
  var leaf_nodes: any;

  useEffect(() => {
    console.log('component mounted')
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    canvas.addEventListener('wheel', function(e){ 

      setTileSize((currentTileSize) => {
        //return currentTileSize
        let newTileSize = {...currentTileSize};
        newTileSize.width += Math.round(e.deltaY/2);
        if (newTileSize.width <= 10) newTileSize.width = 10; 
        newTileSize.height += Math.round(e.deltaY/2);
        if (newTileSize.height <= 10) newTileSize.height = 10;
        return(newTileSize);
      }) 
    })

    //animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));

  }, [])

  useEffect(() => {
    console.log('commits updated');
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // get commits from props
    let commits: any = processCommits(props.commits)

    // set first commit
    var firstCommitHash = leaf_nodes[0]

    // add commits recursively to grid
    console.log('calculating grid')
    populateGridRec(firstCommitHash, commits, ctx, 0, 0);

    cancelAnimationFrame(animationRequestFrameId);

    animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));
  }, [props.commits])

  useEffect(() => {
    console.log('window size or tile size updated');
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    cancelAnimationFrame(animationRequestFrameId);

    // redraw grid
    animationRequestFrameId = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGraph(ctx);
    });
  }, [props.width, props.height, tileSize])


  function drawGraph(this: any, ctx: CanvasRenderingContext2D) {

    // now draw commits that are within bounds of canvas
    // first get min/max x/y that are within bounds
    let min_x = Math.ceil(grid_offset_x / tileSize.width);
    let max_x = Math.floor((props.width+grid_offset_x) / tileSize.width);

    let min_y = Math.ceil(grid_offset_y / tileSize.height);
    let max_y = Math.floor((props.height+grid_offset_y) / tileSize.height);

    let row_count = min_y;
    grid.current.slice(min_y, max_y).forEach(row => {
      row.forEach(col => {
        if(col >= min_x && col <= max_x) {
          drawCommit(ctx, col, row_count);
        }
      });
      row_count += 1;
    });


    //animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));
  }

  function populateGridRec(currentCommitHash: string, commits:any, ctx: CanvasRenderingContext2D, x: number, y: number) {

    if(commits[currentCommitHash]) {  
      // draw current commit
      //drawCommit(ctx, x, y);
      
      // add commit to grid if it hasn't been visited yet
      if(commits[currentCommitHash].visited == false) {
        addToGrid(x, y);
        // mark commit as visited so that we don't draw commits twice
        commits[currentCommitHash].visited = true;
      }
      
      // get parent commits
      let parentCommits = commits[currentCommitHash].parentCommits;


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
        let previousParent = '';
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
          previousParent = parentCommit;
        });
      }
    }
  }

  function addToGrid(x, y) {
    // if this y doesn't exist in the grid yet, add all missing rows to grid
    if(y > grid.current.length-1) {
      let limit = grid.current.length;
      for(var i=0 ; i<=(y-limit) ; i++) {
        grid.current.push([])
      }
    }

    // try and add commit to grid
    if(grid.current[y].indexOf(x) == -1) {
      grid.current[y].push(x)
    } else {
      throw 'Grid position is already taken'
    }

  }

  function findFreeX(y) {
    // if this row doesn't exist yet, then take the first column
    if(y > grid.current.length-1) {
      return 0;
    } else {
      return Math.max(grid.current[y])+1
    }
  }


  function drawCommit(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // get real x/y position
    let real_x = x*tileSize.width - grid_offset_x;
    let real_y = y*tileSize.height - grid_offset_y;

    // draw circle to represent commit
    ctx.beginPath();
    ctx.arc(real_x + tileSize.width/2, real_y + tileSize.height/2, tileSize.height/2-2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    // draw grid
    // ctx.rect(real_x, real_y, tileSize.width, tileSize.height);
    // ctx.stroke()
  }


  function processCommits(commits: any) {

    leaf_nodes = []
    let commitsProcessed: any = {}
    
    // first add all commits to object with parent hashes as array
    commits.forEach((commit: any) => {

      // add this commit as a child com
      let parents = commit.parentHashes.split(" ")
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
      }

    });

    // now work out the child hashes for each commit
    Object.keys(commitsProcessed).forEach(function(key) {
      
      commitsProcessed[key].parentCommits.forEach((parent: any) => {
        
        if(commitsProcessed[parent]) {
          commitsProcessed[parent].childCommits.push(key)
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

  
  return (
    <div style={{borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)'}}>
      <canvas ref={canvasRef} width={props.width} height={props.height}/>
    </div>
  );
}

export default commitGraph