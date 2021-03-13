import React, { useEffect, useRef, useState } from 'react'

interface TooltopProps {
    hash: string,
    x: number;
    y: number;
}

const commitTooltip = (props: TooltopProps) => {

    return (
        <div className='commitTooltip' style={{left: props.x, top: props.y}}>
            <span>{props.hash}</span>
        </div>
    )
}

export default commitTooltip