import React from 'react';

const terminalIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" x="0px" y="0px">
            <g className="outline">
                <path style={{stroke: "#000000", strokeWidth: "2px"}} d="M43.02,43.41H6.98c-1.36,0-2.47-1.1-2.47-2.47V9.06c0-1.36,1.1-2.47,2.47-2.47h36.03c1.36,0,2.47,1.1,2.47,2.47
                    v31.88C45.48,42.3,44.38,43.41,43.02,43.41z"/>
                <line style={{stroke: "#000000", strokeWidth: "2px"}} x1="4.52" y1="13.31" x2="45.48" y2="13.31"/>
                <path style={{stroke: "#000000", strokeWidth: "2px"}} d="M8.52,16.19l5.65,4.04c0.07,0.05,0.07,0.14,0,0.19l-5.66,4.44"/>
                <path style={{stroke: "#000000", strokeWidth: "2px"}} d="M17.04,24.87c1,0.06,6.25-0.06,7.25,0"/>
            </g>
        </svg>

    );
}

export default terminalIcon;