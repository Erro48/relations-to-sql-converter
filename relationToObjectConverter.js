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
				(array[i].match(/\(|\)/g) || []).length % 2 == 0 &&
				!isInParenthesis
			) {
				output.push(array[i])
			} else if (
				(array[i].match(/\(/g) || []).length >
				(array[i].match(/\)/g) || []).length
			) {
				isInParenthesis = true
				parenthesisIndex = i
			} else if (
				(array[i].match(/\(/g) || []).length <
				(array[i].match(/\)/g) || []).length
			) {
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

		if (line.includes('Unique')) {
			line = line.substring(0, line.indexOf(' Unique'))
		}

		line = line.slice(1, -1)

		return this.#splitByNestedParenthesis(line, ', ')
	}

	#getPrimaryKey(line) {
		let keys = this.#getBody(line)[0].slice(1, -1).split(', ')

		keys.forEach((key) => {
			let index = keys.indexOf(key)

			key = {
				value: key.split('>')[0],
				type: key.split('>')[1],
			}

			let value = key

			if (key.value.includes(':')) {
				value = {
					value: this.#extractForeignKey(key.value),
					type: key.type,
				}
			}

			keys[index] = value
		})

		return keys
	}

	#getAttributes(line) {
		let body = this.#getBody(line)
		body.shift()

		body.forEach((attribute) => {
			let index = body.indexOf(attribute)
			let nullable = false
			let autoIncrement = false

			attribute = {
				value: attribute.split('>')[0],
				type: attribute.split('>')[1],
			}

			let value = attribute.value

			if (attribute.value.includes(':')) {
				attribute.value = this.#extractForeignKey(attribute.value)
				value = attribute.value.attribute
			}

			if (value.includes('*')) {
				attribute.value = attribute.value.replace('*', '')
				nullable = true
			}

			if (value.includes('^')) {
				attribute.value = attribute.value.replace('^', '')
				autoIncrement = true
			}

			attribute = {
				...attribute,
				nullable,
				autoIncrement,
			}

			body[index] = attribute
		})

		return body
	}

	#getUnique(line) {
		let index = line.indexOf('Unique')
		if (index === -1) return

		let unique = line.substring(index).slice(7, -1)
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

	return {
		name,
		primaryKey,
		attributes,
		unique,
	}
}

module.exports = convertRelationToObject
