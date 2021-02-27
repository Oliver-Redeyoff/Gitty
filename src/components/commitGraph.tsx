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
    // console.log('unprocessed commits :')
    // console.log(props.commits)

    let commits: any = processCommits(props.commits)

    // console.log('processed commits :')
    // console.log(leaf_nodes)

    // set first commit
    var firstCommitHash = leaf_nodes[0]

    // draw commits recursively
    drawCommitsRec(firstCommitHash, commits, ctx, 1, 1);

    //animationRequestFrameId = requestAnimationFrame(() => drawGraph(ctx));

  }

  function drawCommitsRec(currentCommitHash: string, commits:any, ctx: CanvasRenderingContext2D, x: number, y: number) {
    
    if(commits[currentCommitHash]) {  
      // draw current commit
      drawCommit(ctx, x, y);
      // mark commit as drawn so that we don't draw commits twice
      commits[currentCommitHash].drawn = true;
      
      let parentCommits = commits[currentCommitHash].parentCommits;

      // if no more parents, stop
      if(parentCommits.length == 0) {
        return;
      }
      // if one parent, draw next commit with an incremented x
      else if(parentCommits.length == 1) {
        // stop if the next commit has already been drawn
        if(commits[parentCommits[0]]) {
          if(commits[parentCommits[0]].drawn == true){
            return;
          }
        }
        drawCommitsRec(parentCommits[0], commits, ctx, x, y+1);
      }
      // if there are multiple parents, draw from left to right
      else if(parentCommits.length >= 2) {
        var branchCount = 0;
        parentCommits.forEach((parentCommit: any) => {
          // first branch stays in the same x
          if(branchCount == 0) {
            drawCommitsRec(parentCommit, commits, ctx, x, y+1);
          } else {
            // need to work out by how much to offset x as the previous branch might have multiple ancestor branches
            var xOffset = getAncestorBranchesCountRec(currentCommitHash, commits);
            drawCommitsRec(parentCommit, commits, ctx, x+xOffset, y+1);
          }
          branchCount += 1;
        });
      }
    }
  }

  function getAncestorBranchesCountRec(currentCommitHash: string, commits: any) {

    let parentCommits = commits[currentCommitHash].parentCommits;
    if(parentCommits.length == 0) {
      return 0;
    }
    else if(parentCommits.length == 1) {
      // if we have reached the start of a branch stop
      if(commits[parentCommits[0]].childCommits.length >= 2) {
        return 0;
      } else {
        return getAncestorBranchesCountRec(parentCommits[0], commits);
      }
    }
    else if(parentCommits.length >= 2) {
      let parentCount = 0;
      let branchCount = 0;
      parentCommits.forEach(parentCommit => {
        if(parentCount == 0) {
          parentCount += 1
          branchCount += getAncestorBranchesCountRec(parentCommit, commits);
        } else {
          parentCount += 1
          branchCount += 1 + getAncestorBranchesCountRec(parentCommit, commits);
        }
      });
      return branchCount;
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
        drawn: false
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