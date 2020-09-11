const fs = require('fs');
const path = require('path');

function combineJson() {
	const info = fs.readFileSync(path.join(__dirname, '', '/src/app.config'), {
		encoding: 'utf-8',
	});
	const infoJson = JSON.parse(info);
	console.log(infoJson);
	const indexKey = infoJson['indexKey'];
	console.log({ indexKey });
	const pages = infoJson['pages'];

	const result = {};
	result['indexKey'] = indexKey;
	for (const page of pages) {
		const pageJson = {};
		pageJson[page] = fs.readFileSync(path.join(__dirname, '', `/src/${page}.json`), {
			encoding: 'utf-8',
		});
		Object.assign(result, pageJson);
	}
	fs.writeFileSync(path.join(__dirname, '', '/dist/app.json'), JSON.stringify(result), {
		encoding: 'utf-8',
	});
}

combineJson();
