import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

interface DiffProps {
    sgit: any;
  }

const fillDiffScreen = (props: DiffProps) => {

    //const [diffSummary, setDiffSummary] = useState(null);
    const [diffs, setDiffs] = useState([]);

    const diffSplitRegex = new RegExp("@@[^@]+@@")

    useEffect(() => {
        if(props.sgit != null){
            props.sgit.diffSummary()
                .then((res) => {
                    getDiffData(res).then((res2: any) => {setDiffs(res2)})
                })
        }
    }, []);

    const getDiffData = (diffSummary) => {
        return new Promise(async (resolve) => {
            let tempDiffs = []

            for (const file of diffSummary.files) {
                let tempDiff = {name: file.file, changes: []}
                //props.sgit.diff(file.file)
                //    .then((res) => {tempDiff.changes = res.split(diffSplitRegex)})

                let tempChanges = await props.sgit.diff(file.file);

                tempDiff.changes = tempChanges.split(diffSplitRegex)
                tempDiff.changes.shift();

                tempDiffs.push(tempDiff)
            }

            resolve(tempDiffs);
        })
    }

    return (
        <div style={{height: '100%', overflowY: 'scroll', padding: '20px'}}>
            <h1>Current changes</h1>
            <div style={{marginBottom: "50px"}}>
                {diffs.map((diffgroup, groupIndex) => {
                    console.log(diffgroup)
                    return (<div key={groupIndex+1} style={{backgroundColor: "rgba(0, 0, 0, 0.2)", padding: "10px", marginTop: "20px", boxSizing: "border-box"}}>
                        <code>{diffgroup.name}</code>
                        <span style={{float: "right", marginLeft: "15px", color: 'red'}}>Discard</span>
                        <span style={{float: "right", color: 'green'}}>Commit</span>
                        {diffgroup.changes.map((diff, changeIndex) => {
                            console.log(diff)
                            return <SyntaxHighlighter key={(groupIndex+1)*(changeIndex+1)} language="javascript">{diff}</SyntaxHighlighter>
                        })}
                    </div>)
                })}
            </div>
        </div>
    )
}

export default fillDiffScreen;