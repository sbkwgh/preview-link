let fs = require('fs');
let path = require('path')

let getOGPreviewData = require('./lib/getOGPreviewData');
let getPreviewHTML = require('./lib/getPreviewHTML');

let previewPatterns = 
	fs.readdirSync(path.join(__dirname, 'lib', 'patterns'))
	  .map(file => {
	      return require(path.join(__dirname, 'lib', 'patterns', file));
	  });

module.exports =  async function linkPreview(url) {
	try {
		let previewData, html;

		for(let pattern of previewPatterns) {
			if(pattern.matches(url)) {
				previewData = await pattern.getPreviewData(url);
				break;
			}
		}

		//If the url doesn't match a pattern for a specific
		//site, try getting a possible preview using OG tags
		if(!previewData) previewData = await getOGPreviewData(url);

		//If there is some data scraped from the site for preview, generate a HTML string
		//Otherwise return an error
		if(typeof previewData === 'object' && previewData !== null) {
			html = getPreviewHTML(previewData);
		}

		return { error: null, html: html || previewData };
	} catch (e) {
		let error;

		if (e.message === 'No preview available') {
			error = e.message;
		} else if(e.message && e.response && e.response.status) {
			error = e.message;
		} else {
			error = 'Unknown error'
		}
		
		return { error, html: null };
	}
}