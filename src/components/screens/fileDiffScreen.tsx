import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
const githubCodeTheme = require('../tools/githubCodeTheme.json');

import '../../styles/fileDiff.global.scss';

interface DiffProps {
    sgit: any;
  }

const fileDiffScreen = (props: DiffProps) => {

    const [diffs, setDiffs] = useState([]);

    const diffSplitRegex = new RegExp("@@[^@]+@@")

    useEffect(() => {
        getChanges();

        var intervalId = window.setInterval(function(){
            getChanges();
        }, 1000);

        return (() => {clearInterval(intervalId)})

    }, []);

    const getChanges = () => {
        console.log('getting changes');
        if(props.sgit != null){
            props.sgit.diffSummary()
                .then((res) => {
                    getDiffData(res).then((res2: any) => {setDiffs(res2)})
                })
        }
    }

    const getDiffData = (diffSummary: any) => {
        return new Promise(async (resolve) => {
            let tempDiffs = []

            for (const file of diffSummary.files) {
                let tempDiff = {name: file.file, changes: []}

                let tempChanges = await props.sgit.diff(file.file);

                tempDiff.changes = tempChanges.split(diffSplitRegex)
                tempDiff.changes.shift();

                tempDiffs.push(tempDiff)
            }

            resolve(tempDiffs);
        })
    }

    const detectLanguage = (fileName: string) => {
        return fileName.split('.').pop();
    }

    return (
        <div style={{height: '100%', overflowY: 'scroll', padding: '20px'}}>
            <h1>Current changes</h1>
            <div style={{marginBottom: "50px"}}>
                {diffs.map((diffgroup, groupIndex) => {
                    return (<div key={groupIndex+1} className="fileDiffConatiner">
                        <code>{diffgroup.name}</code>
                        <div className="changeActionBtn discard" style={{float: 'right'}}><span>Discard</span></div>
                        <div className="changeActionBtn commit" style={{float: 'right'}}><span>Stage</span></div>
                        {diffgroup.changes.map((diff, changeIndex) => {
                            let language = detectLanguage(diffgroup.name)
                            return <SyntaxHighlighter key={(groupIndex+1)*(changeIndex+1)} language={language} style={githubCodeTheme}>{diff}</SyntaxHighlighter>
                        })}
                    </div>)
                })}
            </div>
        </div>
    )
}

export default fileDiffScreen;