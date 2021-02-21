import React, { useEffect, useRef, useCallback } from 'react'

interface CanvasProps {
  commits: [{authorDate: string, authorName: string, commitHash: string, parentHashes: any}];
  width: number;
  height: number;
}

const commitGraph = (props: CanvasProps) => {
  
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    drawGraph(ctx);

  }, [])

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    drawGraph(ctx);
  }, [props.width, props.height, props.commits])

  function drawGraph(ctx: CanvasRenderingContext2D) {
    console.log('from draw, commits :')
    console.log(props.commits)

    processCommits(props.commits)

    ctx.fillRect(props.width/2-50, props.height/2-50, 100, 100);

  }

  function processCommits(commits: any) {
    let commitsProcessed: any = {}
    commits.forEach((commit: any) => {

      let parents = commit.parentHashes.split(" ")

      // see if this commits parent commits already exist

      commitsProcessed[commit.commitHash] = {
        authorName: commit.authorName,
        authorDate: commit.authorDate,
        parentHashes: parents
      }

    });

    console.log(commitsProcessed);
  }
  
  return (
    <div style={{borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)'}}>
      <canvas ref={canvasRef} width={props.width} height={props.height}/>
    </div>
  );
}

export default commitGraph