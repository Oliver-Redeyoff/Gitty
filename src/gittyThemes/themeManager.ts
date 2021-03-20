const themeDefaults = {
    page_bg_color: "white",
    
    header_height: "70px",
    header_bg_color: "black",
    header_bottom_border_color: "transparent",
    header_title_color: "white",

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

    this.init = function() {
        return new Promise(resolve => {
            getThemes().then((res: any) => {
                resolve(res);
            })
        })
    }

}

function getThemes() {

    return new Promise(resolve =>{

        const fs = require('fs');
        const path = require('path');
        const themesPath = __dirname + '/gittyThemes/themes';
        let currentThemeFile = 'dark.json';
        let themeData = {};

        // get current theme data
        fs.readdir(themesPath, (err, files) => {

            files.forEach(file => {
                if(currentThemeFile == file) {
                    let rawdata = fs.readFileSync(path.resolve(themesPath, file));
                    themeData = JSON.parse(rawdata);
                }
            });

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

module.exports = themeManager;