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

function convertObjectToSQL(obj) {
	let constraintsFK = []
	let constraintsPK = []
	let attributes = []

	updateTables(obj)

	let query = `CREATE TABLE ${obj.name} (\n`

	try {
		// set keys values
		obj.primaryKey.forEach((key) => {
			let value =
				Object.getPrototypeOf(key) === Object.prototype ? key.attribute : key
			attributes.push(value)
			constraintsPK.push(value)
		})

		// set attributes values
		obj.attributes.forEach((attr) => {
			let value =
				Object.getPrototypeOf(attr) === Object.prototype ? attr.attribute : attr

			console.log(attr)
			displayTables()
			// throw exception : not in order tables

			if (Object.getPrototypeOf(attr) === Object.prototype) {
				constraintsFK.push({
					name: 'FK_' + obj.name,
					value: attr.attribute,
					reference: {
						name: attr.relation,
						value: tables.find((table) => table.name === attr.relation)
							.primaryKey,
					},
				})
			}

			attributes.push(value)
		})
	} catch (exception) {
		throw new Error('Relations are not in order')
	}

	// add attributes
	attributes.forEach((attr) => {
		query += `\t${attr}  NOT NULL,\n`
	})

	query += `\tPRIMARY KEY (${constraintsPK.join(',')}),\n`

	constraintsFK.forEach((fk) => {
		query += `\tCONSTRAINT ${fk.name} FOREIGN KEY (${fk.value}) REFERENCES ${fk.reference.name}(${fk.reference.value}),\n`
	})

	// add primary key constraints
	// if (obj.primaryKey.length == 1) {
	// 	if (Object.getPrototypeOf(obj.primaryKey[0]) === Object.prototype) {
	// 	} else {
	// 		query += `\tPRIMARY KEY (${obj.primaryKey[0]})\n`
	// 	}
	// } else {
	// 	let value = ''
	// 	for (let i = 0; i < obj.primaryKey.length; i++) {
	// 		value += obj.primaryKey[i].attribute + ','
	// 	}
	// 	value = value.slice(0, -1)
	// 	query += `\tCONSTRAINT PK_${obj.name} PRIMARY KEY (${value})\n`
	// }

	// constraintsFK.forEach((fk) => {
	// 	query += `\tCONSTRAINT ${fk.name} FOREING KEY (${fk.value}) REFERENCES ${fk.reference.name}(${fk.reference.value})\n`
	// })

	query += `)`
	return query
}

module.exports = convertObjectToSQL
