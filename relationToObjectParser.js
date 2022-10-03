class Relation {
	constructor(line) {
		this.name = this.#getName(line)
		this.primaryKey = this.#getPrimaryKey(line)
		this.attributes = this.#getAttributes(line)
		this.unique = this.#getUnique(line)
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

		let tmpAttrs = line.split(', ')
		let attrs = []
		let parIndex = -1
		let parFlag = false

		for (let i = 0; i < tmpAttrs.length; i++) {
			if (
				(tmpAttrs[i].indexOf('(') !== -1 && tmpAttrs[i].indexOf(')') !== -1) ||
				(tmpAttrs[i].indexOf('(') === -1 && tmpAttrs[i].indexOf(')') === -1)
			) {
				attrs.push(tmpAttrs[i])
			} else if (tmpAttrs[i].indexOf('(') !== -1) {
				// contiene (
				parFlag = true
				parIndex = i
			} else if (tmpAttrs[i].indexOf(')') !== -1) {
				parFlag = false
				let attr = ''
				for (let j = parIndex; j <= i; j++) {
					attr += tmpAttrs[j] + ', '
				}
				attrs.push(attr.slice(0, -2))
			}
		}

		return attrs
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
			if (attr.split(': ').length == 2) {
				// è fk

				let index = body.indexOf(attr)
				body[index] = this.#extractForeignKey(attr)
			}
		})

		return body
	}

	#getUnique(line) {
		let index = line.indexOf('Unique')
		if (index === -1) return

		let unique = line.substring(index)
		unique = unique.slice(7, -1).split(', ')
		return unique
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
