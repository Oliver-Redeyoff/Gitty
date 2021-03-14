import React, { useEffect, useRef, useState } from 'react'

interface TooltopProps {
    hash: string;
    x: number;
    y: number;
    author: string;
    date: string;
}

const commitTooltip = (props: TooltopProps) => {

    return (
        <div className='commitTooltip' style={{left: props.x, top: props.y}}>
            <b>{props.author}</b> commited this on the <b>{props.date}</b>
        </div>
    )
}

export default commitTooltip;