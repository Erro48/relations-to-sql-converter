class Relation {
	constructor(line) {
		this.name = this.#getName(line)
		this.primaryKey = this.#getPrimaryKey(line)
		this.attributes = this.#getAttributes(line)
		this.unique = this.#getUnique(line)
	}

	#splitByNestedParenthesis(string, separator) {
		let array = string.split(separator)
		let output = []
		let parenthesisIndex = -1
		let isInParenthesis = false

		for (let i = 0; i < array.length; i++) {
			if (
				(array[i].includes('(') && array[i].includes(')')) ||
				(!array[i].includes('(') && !array[i].includes(')'))
			) {
				output.push(array[i])
			} else if (array[i].includes('(')) {
				isInParenthesis = true
				parenthesisIndex = i
			} else if (array[i].includes(')')) {
				isInParenthesis = false
				let attr = ''
				for (let j = parenthesisIndex; j <= i; j++) {
					attr += array[j] + ', '
				}
				output.push(attr.slice(0, -2))
			}
		}

		return output
	}

	#getName(line) {
		return line.split('(')[0]
	}

	#getBody(line) {
		line = line.substring(line.indexOf('('))
		if (line.indexOf(' Unique') !== -1) {
			line = line.substring(0, line.indexOf(' Unique'))
		}
		line = line.slice(1, -1)

		return this.#splitByNestedParenthesis(line, ', ')
	}

	#getPrimaryKey(line) {
		let keys = this.#getBody(line)[0].slice(4, -1).split(', ')

		keys.forEach((k) => {
			let index = keys.indexOf(k)

			if (k.split(': ').length == 2) {
				keys[index] = this.#extractForeignKey(k)
			}
		})

		return keys
	}

	#getAttributes(line) {
		let body = this.#getBody(line)
		body.shift()

		body.forEach((attr) => {
			let objAttr
			let value
			let index = body.indexOf(attr)

			if (attr.split(': ').length == 2) {
				// è fk

				value = this.#extractForeignKey(attr)
			} else {
				value = attr
			}

			if (attr.includes('*')) {
				objAttr = {
					value: value.replace('*', ''),
					nullable: true,
				}
			} else {
				objAttr = {
					value,
					nullable: false,
				}
			}

			body[index] = objAttr
		})

		return body
	}

	#getUnique(line) {
		let index = line.indexOf('Unique')
		if (index === -1) return

		let unique = line.substring(index)

		unique = unique.slice(7, -1)

		let output = this.#splitByNestedParenthesis(unique, ', ')

		output.forEach((attr) => {
			let value = attr
			let index = output.indexOf(attr)
			if (attr.includes('(')) {
				value = attr
					.slice(1, -1)
					.split(', ')
					.map((a) => (a.includes(':') ? this.#extractForeignKey(a) : a))
			}

			output[index] = value
		})

		return output
	}

	#extractForeignKey(attribute) {
		let relation = attribute.split(': ')[0]
		let attr = attribute.split(': ')[1]
		return {
			relation,
			attribute: attr,
		}
	}
}

function convertRelationToObject(line) {
	let rel = new Relation(line)

	let name = rel.name
	let primaryKey = rel.primaryKey
	let attributes = rel.attributes
	let unique = rel.unique

	//console.log(unique)

	return {
		name,
		primaryKey,
		attributes,
		unique,
	}
}

module.exports = convertRelationToObject
