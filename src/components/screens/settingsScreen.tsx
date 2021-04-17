import React, { useState, useEffect } from 'react';
import '../../styles/settings.global.scss';
const { getAvailableThemes, setConfig } = require('../configManager');

interface settingsProps {
    updateTheme: any
}

const settingsScreen = (props: settingsProps) => {

    const [themes, setThemes] = useState([]);

    useEffect(() => {
        let availableThemes = getAvailableThemes();
        console.log(availableThemes);
        setThemes(availableThemes);
    }, []);

    const setTheme = (themeName) => {
        console.log(themeName);
        props.updateTheme(themeName);
    }

    return (
        <div className="settings-screen">
            <h1>Settings</h1>

            <div className="setting-block">
                <div className="description">
                    <h2>Color theme</h2>
                    <h3>This sets the color theme for the app</h3>
                </div>
                <div className="value">
                    {themes.map((theme, index) => (
                        <div key={index} className="theme-box" onClick={() => setTheme(theme["name"])} style={{
                            color: theme["color2"], 
                            backgroundColor: theme["color1"]}}>{theme["name"]}</div>
                    ))}
                    {/* <div className="selected-scheme">Dark</div> */}
                </div>
            </div>

        </div>
    )
}

export default settingsScreen;