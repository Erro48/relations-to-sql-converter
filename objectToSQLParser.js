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
			attributes.push({
				value,
				nullable: false,
			})
			constraintsPK.push(value)
		})

		// set attributes values
		obj.attributes.forEach((attr) => {
			let value =
				Object.getPrototypeOf(attr.value) === Object.prototype
					? attr.value.attribute
					: attr.value

			if (Object.getPrototypeOf(attr.value) === Object.prototype) {
				constraintsFK.push({
					name: 'FK_' + obj.name,
					value: attr.value.attribute,
					reference: {
						name: attr.value.relation,
						value: tables.find((table) => table.name === attr.value.relation)
							.primaryKey,
					},
				})
			}

			attributes.push({
				value,
				nullable: attr.nullable,
			})
		})
	} catch (exception) {
		throw new Error('Relations are not in order')
	}

	// add attributes
	attributes.forEach((attr) => {
		query += `\t${attr.value}  ${attr.nullable ? '' : 'NOT NULL'},\n`
	})

	query += `\tPRIMARY KEY (${constraintsPK.join(',')}),\n`

	constraintsFK.forEach((fk) => {
		query += `\tCONSTRAINT ${fk.name} FOREIGN KEY (${fk.value}) REFERENCES ${fk.reference.name}(${fk.reference.value}),\n`
	})

	query += `)`
	return query
}

module.exports = convertObjectToSQL
