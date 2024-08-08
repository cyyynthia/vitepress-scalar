/*!
 * Copyright (c) Cynthia Rey, All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { type OpenAPI, dereference, load } from '@scalar/openapi-parser'
import { fetchUrls } from '@scalar/openapi-parser/plugins/fetch-urls'
import { readFiles } from '@scalar/openapi-parser/plugins/read-files'

const IS_WEB: boolean = !!import.meta.env

let debug: (...args: any[]) => void
let readFileSync: (path: string | URL, encoding: 'utf8') => string

if (IS_WEB) {
	debug = console.debug
	readFileSync = () => {
		throw new Error('Unreachable code reached?!')
	}
} else {
	const _debug = await import('debug')
	const fs = await import('node:fs')

	debug = _debug.default('vitepress-scalar:openapi-fetch')
	readFileSync = fs.readFileSync
}

async function fetchSpec (spec: string) {
	if (IS_WEB || spec.startsWith('http:') || spec.startsWith('https:')) {
		debug(`Loading remote specification at ${spec}`)
		return fetch(spec).then((r) => r.text())
	}

	debug(`Loading local specification at ${spec}`)
	return readFileSync(spec, 'utf8')
}

export async function loadSpec (specPath: string) {
	const specLookupStart = performance.now()
	const spec = await fetchSpec(specPath)
	const specLookupEnd = performance.now()
	debug(`Retrieved specification in ${Math.round(specLookupEnd - specLookupStart)} ms (${Math.round(spec.length / 1024)} kB)`)

	// https://github.com/scalar/scalar/blob/2f6180a1b4ee99b3f5ddc3129e8ddf35ad2e396b/packages/api-reference/src/helpers/parse.ts#L45-L56
	const specLoadStart = performance.now()

	const { filesystem } = IS_WEB
		? await load(spec, { plugins: [ fetchUrls() ] })
		: await load(spec, { plugins: [ fetchUrls(), readFiles() ] })

	const { schema: _schema, errors } = await dereference(filesystem, { throwOnError: true })

	if (errors?.length) throw errors[0]
	if (!_schema) throw new Error('Failed to parse the OpenAPI file.')

	const specLoadEnd = performance.now()
	debug(`Parsed specification in ${Math.round(specLoadEnd - specLoadStart)} ms`)

	// TODO: get rid of it when upstream migrated away -- https://github.com/scalar/scalar/blob/2f6180a1b4ee99b3f5ddc3129e8ddf35ad2e396b/packages/api-reference/src/helpers/parse.ts#L3
	// https://github.com/scalar/scalar/blob/2f6180a1b4ee99b3f5ddc3129e8ddf35ad2e396b/packages/api-reference/src/helpers/parse.ts#L85-L257
	// Upstream they clone the object to avoid mutating it, but idgaf about that here :)
	// doesn't handle webhook stuff either.

	const schema = structuredClone(_schema)
	schema.tags ??= []
	schema.paths ??= {}

	let DEFAULT_TAG = schema.tags.find((t: any) => t.name === 'default')
	for (const [ pathname, path ] of Object.entries(schema.paths)) {
		for (const [ method, operation ] of Object.entries<OpenAPI.Operation>(path)) {
			if (!operation || operation['x-internal'] === true) continue

			const newOperation = {
				httpVerb: method.toUpperCase(),
				path: pathname,
				operationId: operation.operationId || pathname,
				name: operation.summary || pathname || '',
				description: operation.description || '',
				information: { ...operation },
				pathParameters: path.parameters,
			}

			if (!operation.tags?.length) {
				if (!DEFAULT_TAG) schema.tags.push(DEFAULT_TAG = { name: 'default', description: '', operations: [] })
				DEFAULT_TAG['operations'].push(newOperation)
			}

			if (operation.tags) {
				for (const operationTag of operation.tags) {
					let tag = schema.tags.find((t: any) => t.name === operationTag)
					if (!tag) schema.tags.push(tag = { name: operationTag, description: '' })

					tag['operations'] ??= []
					tag['operations'].push(newOperation)
				}
			}
		}
	}

	debug(`Loaded specification in ${Math.round(specLoadEnd - specLookupStart)} ms`)
	return { filesystem, schema }
}
