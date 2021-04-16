import React from 'react';
import '../../styles/settings.global.scss';

const settingsScreen = () => {
    return (
        <div className="settings-screen">
            <h1>Settings</h1>

            <div className="setting-block">
                <div className="description">
                    <h2>Color theme</h2>
                    <h3>This sets the color theme for the app</h3>
                </div>
                <div className="value">
                    <div className="selected-scheme">Dark</div>
                </div>
            </div>

        </div>
    )
}

export default settingsScreen;