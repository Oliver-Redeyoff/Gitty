import React, { useEffect, useRef, useCallback } from 'react'

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
  var grid = []
  //
  const grid_tile_width: number = 50;
  const grid_tile_height: number = 50;
  // list of top level elements
  var leaf_nodes: any;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));

  }, [])

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    cancelAnimationFrame(animationRequestFrameId);

    animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));
  }, [props.width, props.height, props.commits])


  function drawGraph(this: any, ctx: CanvasRenderingContext2D) {

    // get commits from props
    let commits: any = processCommits(props.commits)

    // set first commit
    var firstCommitHash = leaf_nodes[0]

    // add commits recursively to grid
    populateGridRec(firstCommitHash, commits, ctx, 1, 1);

    // now draw commits that are within bounds of canvas

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
    if(y > grid.length-1) {
      let limit = grid.length;
      for(var i=0 ; i<=(y-limit) ; i++) {
        grid.push([])
      }
    }

    console.log(grid)
    // try and add commit to grid
    if(grid[y].indexOf(x) == -1) {
      grid[y].push(x)
    } else {
      throw 'Grid position is already taken'
    }

  }

  function findFreeX(y) {
    // if this row doesn't exist yet, then take the first column
    if(y > grid.length-1) {
      return 0;
    } else {
      return Math.max(grid[y])+1
    }
  }


  function drawCommit(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // draw circle to represent commit
    ctx.beginPath();
    ctx.arc(x*grid_tile_width + grid_tile_width/2, y*grid_tile_height + grid_tile_height/2, 15, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    // draw grid
    ctx.rect(x*grid_tile_width, y*grid_tile_height, grid_tile_width, grid_tile_height);
    ctx.stroke()
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