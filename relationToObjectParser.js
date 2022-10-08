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

			k = {
				value: k.split('>')[0],
				type: k.split('>')[1],
			}

			if (k.value.split(': ').length == 2) {
				keys[index] = {
					value: this.#extractForeignKey(k.value),
					type: k.type,
				}
			} else {
				keys[index] = k
			}
		})

		return keys
	}

	#getAttributes(line) {
		let body = this.#getBody(line)
		body.shift()

		body.forEach((attribute) => {
			let objAttribute
			let index = body.indexOf(attribute)

			attribute = {
				value: attribute.split('>')[0],
				type: attribute.split('>')[1],
			}

			let value =
				attribute.value.split(': ').length == 2
					? this.#extractForeignKey(attribute.value)
					: attribute.value

			objAttribute = attribute.value.includes('*')
				? {
						value: value.replace('*', ''),
						nullable: true,
						type: attribute.type,
				  }
				: { value, nullable: false, type: attribute.type }

			body[index] = objAttribute
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

	return {
		name,
		primaryKey,
		attributes,
		unique,
	}
}

module.exports = convertRelationToObject
