const util = require('util')
let tables = []

function updateTables(obj) {
	let table

	if (obj.primaryKey.length > 1) {
		let keys = []
		obj.primaryKey.forEach((key) => {
			keys.push(key.attribute)
		})
		table = {
			name: obj.name,
			primaryKey: keys,
		}
	} else {
		table = {
			name: obj.name,
			primaryKey: obj.primaryKey,
		}
	}
	tables.push(table)
}

function displayTables() {
	console.log(
		util.inspect(tables, { showHidden: false, depth: null, colors: true })
	)
}

function convertObjectToSQL(obj, typeFlag) {
	let constraintsFK = []
	let constraintsPK = []
	let attributes = []
	let uniques = []

	updateTables(obj)

	let query = `CREATE TABLE ${obj.name} (\n`

	try {
		// set keys values
		obj.primaryKey.forEach((key) => {
			let value =
				Object.getPrototypeOf(key.value) === Object.prototype
					? key.value.attribute
					: key.value
			let type = key.type

			if (Object.getPrototypeOf(key.value) === Object.prototype) {
				let tmp = {
					name: 'FK_' + obj.name + '_' + key.value.attribute,
					value: key.value.attribute,
					reference: {
						name: key.value.relation,
						value: tables.find((table) => table.name === key.value.relation)
							.primaryKey[0].value,
					},
				}

				constraintsFK.push(tmp)
			}

			attributes.push({
				value,
				type,
				nullable: false,
				autoIncrement: key.autoIncrement,
			})
			constraintsPK.push(value)
		})

		// set attributes values
		obj.attributes.forEach((attr) => {
			let value =
				Object.getPrototypeOf(attr.value) === Object.prototype
					? attr.value.attribute
					: attr.value
			let type = attr.type

			if (Object.getPrototypeOf(attr.value) === Object.prototype) {
				let tmp = {
					name: 'FK_' + obj.name + '_' + attr.value.attribute,
					value: attr.value.attribute,
					reference: {
						name: attr.value.relation,
						value: tables.find((table) => table.name === attr.value.relation)
							.primaryKey[0].value,
					},
				}

				constraintsFK.push(tmp)
			}

			attributes.push({
				value,
				type,
				nullable: attr.nullable,
				autoIncrement: attr.autoIncrement,
			})
		})

		if (obj.unique !== undefined) {
			obj.unique.forEach((attr) => {
				let uniqueObj = {
					name: 'UN_',
				}
				if (Array.isArray(attr)) {
					let innerAttr = []
					attr.forEach((a) => {
						if (a.attribute !== undefined) {
							a = a.attribute
						}
						innerAttr.push({ value: a })
					})

					uniqueObj = {
						name: 'UN_' + innerAttr[0].value,
						value: innerAttr.map((a) => a.value),
					}
				} else {
					uniqueObj = {
						name: 'UN_' + attr,
						value: attr,
					}
				}

				uniques.push(uniqueObj)
			})
		}
	} catch (exception) {
		throw new Error('Relations are not in order')
	}

	// add attributes
	attributes.forEach((attr) => {
		query += `\t${attr.value} ${typeFlag ? attr.type : ''} ${
			attr.nullable ? '' : 'NOT NULL'
		}`

		query += `${attr.autoIncrement ? ' AUTO_INCREMENT' : ''}`

		query += `,\n`
	})

	query += `\tCONSTRAINT PK_${obj.name} PRIMARY KEY (${constraintsPK.join(
		','
	)}),\n`

	constraintsFK.forEach((fk) => {
		query += `\tCONSTRAINT ${fk.name} FOREIGN KEY (${fk.value}) REFERENCES ${fk.reference.name}(${fk.reference.value}),\n`
	})

	uniques.forEach((unique) => {
		let value = unique.value
		if (Array.isArray(unique)) {
			value = unique.map((un) => un.value).join(',')
		}

		query += `\tCONSTRAINT ${unique.name} UNIQUE (${value}),\n`
	})

	query = query.slice(0, -2) + '\n'
	query += `);`
	return query
}

module.exports = convertObjectToSQL
