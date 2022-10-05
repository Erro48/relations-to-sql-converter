const convertRelationToObject = require('./relationToObjectParser')
const convertObjectToSQL = require('./objectToSQLParser')
const fs = require('fs')
const readline = require('readline')
const path = require('path')

async function relationsToSql(filepath, dbCreationFlag, typeFlag) {
	const fileStream = fs.createReadStream(filepath)
	let fileContent = ''
	let queries = ''
	let db = {
		name: path.basename(filepath).split('.')[0],
		tables: [],
	}

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	for await (const line of rl) {
		let obj = convertRelationToObject(line)
		db.tables.push(obj)
	}

	for (const obj of db.tables) {
		let query = convertObjectToSQL(obj, typeFlag)
		queries += query + '\n'
	}

	if (dbCreationFlag) {
		fileContent = `IF EXISTS ${db.name};\nDROP DATABASE ${db.name};\nCREATE DATABASE ${db.name};\nUSE ${db.name};\n\n`
	}

	fileContent += queries

	fs.writeFile(db.name + '.sql', fileContent, (err) =>
		err ? console.log(err) : 'File is ready'
	)
}

module.exports = relationsToSql
