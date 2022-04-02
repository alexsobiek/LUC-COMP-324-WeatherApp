const fs = require("fs");
const path = require("path");

module.exports = class TemplateEngine {
    viewsPath;
    css = [];
    js = [];

    /**
     * Constructor
     * @param app {Application}
     */
    constructor(app) {
        app.set("view engine", "html");
        app.set("templateEngine", this);
        app.engine("html", this.render);
        this.viewsPath = app.get("views");
    }

    /**
     * Adds a CSS file to be included on all pages
     * @param file File, relative to views/css
     */
    addCss(file) {
        this.css.push(this.formatCssString(file));
    }

    /**
     * Adds a JavaScript file to be included on all pages
     * @param file File, relative to views/js
     */
    addJs(file) {
        this.js.push(this.formatJsString(file))
    }

    formatCssString(file) {
        return `<link rel="stylesheet" type="text/css" href="/css/${file}">`
    }

    formatJsString(file) {
        return `<script type="text/javascript" src="/js/${file}"></script>`
    }

    /** @private */
    getPath(name) {
        return path.join(this.viewsPath, name);
    }

    /** @private */
    compileView(options, content) {
        Array.from(content.matchAll(/\{\{(.*?)\}\}/g), match => {
            let tokens = match[1].split(/\s+/);
            let val = "";
            switch (tokens[0].toUpperCase()) {
                case "INCLUDE": { // include file
                    // This must be sync, nesting async calls results in the callback being called before the
                    // nested async call has finished.
                    val = this.compileView(options, fs.readFileSync(this.getPath(tokens[1])).toString());
                    break;
                }
                case "VAR": { // variable
                    val = options[tokens[1]];
                    break;
                }
                case "CSS": {
                    this.css.forEach(c => val += `${c}\n`);
                    if (options.css) options.css.forEach(c => val += `${this.formatCssString(c)}\n`);
                    break;
                }
                case "JS": {
                    this.js.forEach(c => val += `${c}\n`);
                    if (options.js) options.js.forEach(j => val += `${this.formatJsString(j)}\n`);
                    break;
                }
            }
            if (val !== "") content = content.replace(match[0], val);
        });
        return content;
    }

    /** @private */
    render(path, options, callback) {
        fs.readFile(path, (err, buffer) => {
            if (err) return callback(err); else {
                let content = options.settings.templateEngine.compileView(options, buffer.toString());
                return callback(null, content);
            }
        });
    }


}