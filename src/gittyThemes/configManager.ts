const electron = require('electron');

const themeDefaults = {
    page_bg_color: "white",
    
    header_height: "70px",
    header_bg_color: "black",
    header_bottom_border_color: "transparent",
    header_title_color: "white",
    header_title_bottom_border_color: "transparent",

    sidebar_bg_color: "black",
    sidebar_border_color: "transparent",
    sidebar_item_color: "white",
    sidebar_item_bg_color: "grey",

    content_bg_color: "black",
    content_border_color: "transparent",
    content_commit_bg_color: "white",
    content_commit_text_color: "black",
    content_commit_link_color: "white"
}


function themeManager() {

    this.init = function(signal: AbortSignal) {
        return new Promise((resolve, reject) => {
            getTheme().then((res: any) => {
                resolve(res);
            })
            signal.addEventListener('abort',() => {
                reject('error');
            });
        })
    }

}

function getTheme() {

    return new Promise(resolve =>{

        const fs = require('fs');
        const path = require('path');
        const themesPath = __dirname + '/gittyThemes/themes';
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

    });

}

module.exports = {
    themeManagerModule: themeManager
};