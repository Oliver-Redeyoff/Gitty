const electron = require('electron');
const fs = require('fs');
const path = require('path');

const themeDefaults = {
    "page_bg_color": "white",
    
    "header_height": "70px",
    "header_bg_color": "black",
    "header_bottom_border_color": "transparent",
    "header_title_color": "white",
    "header_title_bottom_border_color": "transparent",

    "sidebar_bg_color": "black",
    "sidebar_border_color": "transparent",
    "sidebar_item_color": "white",
    "sidebar_item_bg_color": "grey",

    "content_bg_color": "black",
    "content_border_color": "transparent",
    "content_commit_bg_color": "white",
    "content_commit_text_color": "black",
    "content_commit_link_color": "white"
}

const configDefaults = {
    "theme": "light",
    "repoPath": ""
}


export async function getTheme(signal: AbortSignal) {
    return new Promise((resolve, reject) => {

        signal.addEventListener('abort',() => {
            reject('error');
        });

        const themesPath = __dirname + '/gittyThemes';
        let currentThemeFile = 'gruvbox.json';
        let themeData = {};

        // get current theme data
        fs.readdir(themesPath, (_: any, files: any) => {
            
            if(files != null) {
                files.forEach(file => {
                    if(currentThemeFile == file) {
                        let rawdata = fs.readFileSync(path.resolve(themesPath, file));
                        themeData = JSON.parse(rawdata);
                    }
                });
            }

            // file in missing values
            let colorList = Object.keys(themeDefaults);
            colorList.forEach((color: any) => {
                if(!themeData.hasOwnProperty(color)) {
                    themeData[color] = themeDefaults[color];
                }
            })

            resolve(themeData);

        });
    })
}


export function getConfig() {
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


export function setConfig(newConfigProperties) {
    const configFilePath = electron.remote.app.getPath('userData') + "/config.json";
    let config = configDefaults;

    // read the current config file
    try {
        let rawConfig = fs.readFileSync(configFilePath, 'utf8');
        config = JSON.parse(rawConfig);
        // need to update config with any mising defaults
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