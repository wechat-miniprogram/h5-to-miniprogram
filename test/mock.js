let selectorQueryRes = []

class SelectorQuery {
    in() {
        return this
    }
    selectAll() {
        return this
    }
    fields() {
        return this
    }
    exec(callback) {
        callback(selectorQueryRes)
    }
}

global.wx = {
    createSelectorQuery() {
        return new SelectorQuery()
    },
}

module.exports = {
    html: `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>test</title>
                <link rel="stylesheet" href="./css/a.css">
                <link rel="stylesheet" href="./css/b.css">
                <style>
                    .a {
                        color: green;
                    }
                </style>
            </head>
            <body>
                <div class="aa">
                    <div id="bb" class="bb">
                        <header>
                            <div class="bb1">123</div>
                            <div class="bb2" data-a="123">321</div>
                        </header>
                        <div class="bb3">middle</div>
                        <footer>
                            <span id="bb4" class="bb4" data-index=1>1</span>
                            <span class="bb4" data-index=2>2</span>
                            <span class="bb4" data-index=3>3</span>
                        </footer>
                        <div>tail</div>
                    </div>
                </div>
                <script src="./js/a.js"></script>
                <script src="./js/b.js"></script>
                <script>
                    console.log('hello');
                </script>
            </body>
        </html>
    `,
    wx: global.wx,
    setSelectorQueryRes(res) {
        selectorQueryRes = [res]
    },
};
