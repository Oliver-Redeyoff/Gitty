const electron = require('electron');
const fs = require('fs');
const path = require('path');

const themeDefaults = {
    "default": {
        "page_bg_color": "white",
        
        "header_height": "70px",
        "header_bg_color": "black",
        "header_bottom_border_color": "transparent",
        "header_title_color": "white",
        "header_title_bottom_border_color": "transparent",
        "header_repo_icon_color": "black",
        "header_repo_text_color": "white",
        "header_repo_border_color": "white",

        "sidebar_bg_color": "black",
        "sidebar_border_color": "transparent",
        "sidebar_item_color": "white",
        "sidebar_item_bg_color": "grey",

        "content_bg_color": "black",
        "content_border_color": "transparent",
        "content_commit_bg_color": "white",
        "content_commit_text_color": "black",
        "content_commit_link_color": "white"
    },
    "light": {
        "page_bg_color": "white",
    
        "header_bg_color": "#f8f5f1",
        "header_title_color": "#e9896a",
        "header_repo_border_color": "#e9896a",
        "header_repo_text_color": "#e9896a",

        "sidebar_bg_color": "#f8f5f1",
        "sidebar_item_color": "#e9896a",
        "sidebar_item_bg_color": "#edeae6",

        "content_bg_color": "#f8f5f1",
        "content_commit_bg_color": "#e9896a",
        "content_commit_text_color": "white",
        "content_commit_link_color": "black"
    },
    "dark": {
        "page_bg_color": "#252525",
    
        "header_bg_color": "#252525",
        "header_bottom_border_color": "#1f1f1f",
        "header_title_color": "#e8e8e8",
        "header_repo_border_color": "#e8e8e8",
        "header_repo_text_color": "#e8e8e8",

        "sidebar_bg_color": "#252525",
        "sidebar_border_color": "#1f1f1f",
        "sidebar_item_color": "#e8e8e8",
        "sidebar_item_bg_color": "#6e7c7c",

        "content_bg_color": "#252525",
        "content_border_color": "#1f1f1f",
        "content_commit_bg_color": "#435560",
        "content_commit_text_color": "white",
        "content_commit_link_color": "black"
    }

}

const configDefaults = {
    "theme": "light",
    "repoPath": ""
}


export function getTheme(theme: string, signal: AbortSignal) {

    let themeData = {};

    signal.addEventListener('abort',() => {
        return;
    });

    if(themeDefaults[theme]) {
        themeData = themeDefaults[theme];
    } else {
        const themePath = electron.remote.app.getPath('userData') + '/gittyThemes' + theme + '.json';
        try {
            let rawData = fs.readFileSync(themePath, 'utf8');
            themeData = JSON.parse(rawData);
        } catch(_) {}
    }

    if(Object.keys(themeData).length == 0) {
        themeData = themeDefaults["light"];
    }

    // file in missing values
    let colorList = Object.keys(themeDefaults["default"]);
    colorList.forEach((color: any) => {
        if(!themeData.hasOwnProperty(color)) {
            themeData[color] = themeDefaults["default"][color];
        }
    })

    return themeData;

}


export function getConfig() {
    if(electron.remote) {
        const configFilePath = electron.remote.app.getPath('userData') + "/config.json";
        let newConfig = {};

        // read the current config file
        try {
            let rawConfig = fs.readFileSync(configFilePath, 'utf8');
            newConfig = JSON.parse(rawConfig);
            // need to update config with any mising defaults
        } catch(_) {}

        // add any missing config elements
        let configDefaultKeys = Object.keys(configDefaults);
        configDefaultKeys.forEach((configDefaultKey: any) => {
            if(!newConfig.hasOwnProperty(configDefaultKey)) {
                newConfig[configDefaultKey] = configDefaults[configDefaultKey];
            }
        });

        fs.writeFile(configFilePath, JSON.stringify(newConfig), function (err) {
            if (err) throw err;
        });

        return newConfig;
    }
    return configDefaults;
}


export function setConfig(newConfigProperties) {
    if(electron.remote) {
        const configFilePath = electron.remote.app.getPath('userData') + "/config.json";
        let config = configDefaults;

        try {
            let rawConfig = fs.readFileSync(configFilePath, 'utf8');
            config = JSON.parse(rawConfig);
        } catch(_) {}

        let newConfigKeys = Object.keys(newConfigProperties);
        newConfigKeys.forEach((newConfigKey: any) => {
            config[newConfigKey] = newConfigProperties[newConfigKey];
        });

        fs.writeFile(configFilePath, JSON.stringify(config), function (err) {
            if (err) throw err;
        });

        return config;
    }
    return configDefaults;
}