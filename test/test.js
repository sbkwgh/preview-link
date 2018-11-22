let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

let getOGPreviewData = require('../lib/getOGPreviewData');
let getPreviewHTML = require('../lib/getPreviewHTML');
let linkPreview = require('../index');

let github = require('../lib/patterns/github');
let wikipedia = require('../lib/patterns/wikipedia');
let twitter = require('../lib/patterns/twitter');
let amazon = require('../lib/patterns/amazon');


describe('link_expansion', () => {
	describe('errors', () => {
		it('should return an error if URl does not exist', async () => {
			let res = await linkPreview('https://en.wikipedia.org/wiki/not_a_real_url_404')

			res.should.have.property(
				'error',
				'Request failed with status code 404'
			);

			res.should.have.property(
				'html',
				null
			);

		});
	});

	describe('getOGPreviewData', () => {
		it('should return an object containing relevant OG data', async () => {
			let data = await getOGPreviewData('https://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election')

			data.should.have.property(
				'title',
				'Revealed: 50 million Facebook profiles harvested for Cambridge Analytica in major data breach'
			);
			data.should.have.property(
				'description'
			);
			data.should.have.property(
				'url',
				'http://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election'
			);
			data.should.have.property(
				'image'
			);
		});
		it('should use other meta or title tags if there is no OG tags availible', async () => {
			let data = await getOGPreviewData('http://ejs.co');
			data.should.have.property('title', 'EJS -- Embedded JavaScript templates');
			data.should.have.property(
				'description',
				"'E' is for 'effective'. EJS is a simple templating language that lets you generate HTML markup with plain JavaScript. No religiousness about how to organize things. No reinvention of iteration and control-flow. It's just plain JavaScript."
			);
		});
		it('should return an error if there is no OG tags availible', async () => {
			try {
				let data = await getOGPreviewData('http://blank.org');
			} catch (e) {
				e.should.have.property('message', 'No preview available');
			}
		});
	});

	describe('getPreviewHTML', () => {
		it('should return an HTML string for given object', () => {
			let res = getPreviewHTML({
				url: 'http://www.example.com',
				description: 'description',
				title: 'title',
				image: 'image'
			});

			(typeof res).should.equal('string');
		})
		it('should correctly deal with the conditional', () => {
			let res = getPreviewHTML({
				url: 'http://www.example.com',
				description: 'description',
				title: 'title'
			});
			(typeof res).should.equal('string');
		})
	});

	describe('linkPreview', () => {
		it('should get a HTML string from an OG link', async () => {
			let res = await linkPreview('https://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election');

			(typeof res.html).should.equal('string');
			res.html.length.should.be.above(0);
		});

		it('should get a HTML string from a custom pattern', async () => {
			let res = await linkPreview('https://en.wikipedia.org/wiki/google');

			(typeof res.html).should.equal('string');
			res.html.length.should.be.above(0);
		});

		it('should return an empty string from an invalid site', async () => {
			let res = await linkPreview('http://blank.org');

			expect(res.html).to.be.null;
			res.error.length.should.be.above(0);
		});
	});

	describe('GitHub', () => {
		it('should match a valid GitHub url', () => {
			github.matches('https://github.com/sbkwgh/forum').should.not.be.null;
			github.matches('http://github.com/sbkwgh/forum').should.not.be.null;
			
			expect(github.matches('http://notgithub.com/sbkwgh/forum')).to.be.null;
		});
		it('should return a data object', async () => {
			let data = await github.getPreviewData('https://github.com/sbkwgh/forum');

			data.should.have.property('title', 'sbkwgh/forum')
			data.should.have.property('url', 'https://github.com/sbkwgh/forum')
			data.should.have.property('description', 'Forum software created using Express, Vue, and Sequelize')
		});
	});

	describe('Wikipedia', () => {
		it('should match a valid Wikipedia url', () => {
			wikipedia.matches('https://en.wikipedia.org/wiki/google').should.not.be.null;
			wikipedia.matches('http://fr.wikipedia.org/wiki/google').should.not.be.null;
			
			expect(wikipedia.matches('http://en.wikipedia.org/notapage')).to.be.null;
		});
		it('should return a data object', async () => {
			let data = await wikipedia.getPreviewData('https://en.wikipedia.org/wiki/google');

			data.should.have.property('title', 'Google')
			data.should.have.property('url', 'https://en.wikipedia.org/wiki/Google')
			data.description.should.have.length(503)
		});
	});

	describe('Twitter', () => {
		it('should match a valid Wikipedia url', () => {
			twitter.matches('https://twitter.com/user/status/12345').should.not.be.null;
			
			expect(twitter.matches('http://twitter.com/notapage/123456')).to.be.null;
			expect(twitter.matches('http://twitter.com/notapage/status/qwertyu')).to.be.null;
		});
		it('should return a data object', async () => {
			let HTML = await twitter.getPreviewData('https://twitter.com/Interior/status/463440424141459456');

			(typeof HTML).should.equal('string');
			HTML.should.have.length.above(0);
		});
	});

	describe('Amazon', () => {
		it('should match a valid Amazon url', () => {
			amazon.matches('https://www.amazon.co.uk/gp/product/0199858616').should.not.be.null;
			amazon.matches('https://smile.amazon.co.uk/gp/product/0199858616').should.not.be.null;
			amazon.matches('https://www.amazon.co.uk/Betron-Isolating-Earphones-Headphones-Microphone-Black/dp/B01N1X4910').should.not.be.null;
			amazon.matches('http://amazon.co.uk/Sony-5-5-Inch-Android-SIM-Free-Smartphone-Gold/dp/B0792GT5T4/ref=dfg').should.not.be.null;
			
			expect(amazon.matches('https://www.amazon.co.uk/gp/dmusic/promotions/AmazonMusicUnlimited')).to.be.null;
			expect(amazon.matches('https://www.amazon.co.uk/')).to.be.null;
		});

		it('should return a correct data object', async () => {
			let data = await amazon.getPreviewData(
				`https://www.amazon.co.uk/gp/product/B005G39HUK/ref=s9u_ri_gw_i2?ie=UTF8&fpl=fresh&pd_rd_i=B005G39HUK&pd_rd_r=4edec2c7-2abc-11e8-9a21-019e4b2648c4&pd_rd_w=jtpWg&pd_rd_wg=lyBTu&pf_rd_m=A3P5ROKL5A1OLE&pf_rd_s=&pf_rd_r=8G2NPHM6AE411J2M0V6Z&pf_rd_t=36701&pf_rd_p=81d63d24-31ce-4958-9c19-bb66b139bc25&pf_rd_i=desktop`
			);

			data.should.have.property(
				'description',
				"Fruit of the Loom Men's Super Premium Short Sleeve T-Shirt: Free UK Shipping on Orders Over £10 and Free 30-Day Returns on Selected Fashion Items sold or fulfilled by Amazon."
			);
			data.should.have.property(
				'url',
				'https://www.amazon.co.uk/gp/product/B005G39HUK'
			);
			data.should.have.property(
				'title',
				"Fruit of the Loom Men's Super Premium Short Sleeve T-Shirt"
			);
			data.should.have.property(
				'image'
			);
			data.partial.includes('out of 5 stars').should.be.true;
		});
	});
})