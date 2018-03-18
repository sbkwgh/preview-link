# preview-link

Package which generates a HTML string as a preview or summary of a webpage.

Custom support for Twitter, GitHub, Wikipedia, Amazon and more to come.    
Otherwise uses Open Graph data, with other meta-tags as a fallback to generate the preview.

## Usage
Preview-link has a very simple API - it's just one function.

    let previewLink = require('preview-link');

    //Then either use it with async/await or as a promise
    async function getHTML (url) {
        return await previewLink(url);
    }

    previewLink(url).then(HTML => /* do something */).catch(err => /* catch something */);
