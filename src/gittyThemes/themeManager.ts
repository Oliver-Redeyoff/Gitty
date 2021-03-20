const themeDefaults = {
    page_bg: "green",
    
    header_bg: "black",
    header_title: "white",

    sidebar_bg: "white",
    sidebar_item: "black",
    sidebar_item_bg: "black",

    content_bg: "white"
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
        let currentThemeFile = 'light.json';
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