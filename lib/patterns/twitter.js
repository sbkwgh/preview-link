let axios = require('axios');

module.exports = {
	matches (url) {
		return url.match(/^https?:\/\/(www\.)?twitter\.com\/.+\/status\/\d+/i);
	},
	async getPreviewData (url) {
		let res = await axios.get('https://publish.twitter.com/oembed?url=' + url);
		return res.data.html;
	}
};