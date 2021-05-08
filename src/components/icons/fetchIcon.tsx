import React from 'react';

const fetchIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" x="0px" y="0px">
            <path className="outline arrow" style={{fill: "transparent", stroke: "#000000", strokeWidth: "20px"}} d="M151.6,251.2l89.97,139.55c3.9,6.06,12.76,6.06,16.67,0l90.17-139.87c4.23-6.57-0.44-15.22-8.25-15.28
                l-38.23-0.32c-5.45-0.04-9.83-4.47-9.83-9.92V114.64c0-5.47-4.43-9.92-9.92-9.92H216.2c-5.47,0-9.92,4.43-9.92,9.92v111.7
                c0,5.52-4.5,9.97-10,9.92l-36.25-0.34C152.14,235.85,147.33,244.57,151.6,251.2z"/>
            <path className="outline box" style={{fill: "transparent", stroke: "#000000", strokeWidth: "20px"}} d="M437.19,472.28H60.81c-19.38,0-35.09-15.71-35.09-35.09V60.81c0-19.38,15.71-35.09,35.09-35.09h376.38
                c19.38,0,35.09,15.71,35.09,35.09v376.38C472.28,456.57,456.57,472.28,437.19,472.28z"/>
        </svg>
    );
}

export default fetchIcon;