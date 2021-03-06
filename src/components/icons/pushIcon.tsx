import React from 'react';

const pushIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" x="0px" y="0px">
            <path className="fill arrow" style={{fill: "#000000", stroke: "#000000", strokeWidth: "10px"}} d="M346.6,251.42l-89.97-139.54c-3.9-6.06-12.76-6.06-16.66,0L149.8,251.74c-4.23,6.57,0.44,15.22,8.25,15.29
                l38.24,0.32c5.44,0.05,9.83,4.47,9.83,9.91v110.72c0,5.48,4.44,9.91,9.91,9.91H282c5.48,0,9.91-4.44,9.91-9.91v-111.7
                c0-5.51,4.49-9.96,10.01-9.91l36.25,0.34C346.07,266.78,350.88,258.05,346.6,251.42z"/>
            <path className="outline box" style={{fill: "transparent", stroke: "#000000", strokeWidth: "20px"}} d="M438.19,473.28H61.81c-19.38,0-35.09-15.71-35.09-35.09V61.81c0-19.38,15.71-35.09,35.09-35.09h376.38
                c19.38,0,35.09,15.71,35.09,35.09v376.38C473.28,457.57,457.57,473.28,438.19,473.28z"/>
        </svg>
    );
}

export default pushIcon;