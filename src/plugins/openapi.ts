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

import type { Plugin } from 'vite'
import type { PageData, SiteConfig, TransformPageContext } from 'vitepress'
import type { OpenAPI } from '@scalar/openapi-parser'

import { resolve, dirname } from 'node:path'
import { loadSpec } from '../core/fetch.js'
import { getSidebarItems } from '../core/sidebar.js'

export type OpenApiPageData =
	| { type: 'local', spec: OpenAPI.Document }
	| { type: 'remote', url: string }

function resolveSpec (spec: string, base: string) {
	if (spec.startsWith('http:') || spec.startsWith('https:')) return spec
	return resolve(base, spec)
}

export function createOpenApiPlugin(): Plugin {
	const openApiSpecCache = new Map<string, { schema: OpenAPI.Document, sidebar: any }>()

	async function transformPageData (data: PageData, ctx: TransformPageContext) {
		// Cast `any` to `unknown` to enforce proper handling
		const specPath = data.frontmatter['spec'] as unknown
		const fetchInBrowser = data.frontmatter['fetchInBrowser'] as unknown

		// Check frontmatter.
		if (!specPath)
			throw new TypeError('No spec provided.')

		if (typeof specPath !== 'string')
			throw new TypeError('Invalid value: `spec` must be a filepath or an URL.')

		if (typeof fetchInBrowser !== 'boolean' && fetchInBrowser !== undefined)
			throw new TypeError('Invalid value: `fetchInBrowser` must be a boolean.')

		const isSpecRemote = specPath.startsWith('http:') || specPath.startsWith('https:')
		if (fetchInBrowser) {
			if (!isSpecRemote) {
				throw new Error('Invalid configuration: cannot use `fetchInBrowser` with a local `spec`.')
			}

			// Don't do further processing - it will happen in the browser.
			return { openapi: { type: 'remote', url: specPath } satisfies OpenApiPageData }
		}

		// Resolve spec path.
		const markdownFile = resolve(ctx.siteConfig.srcDir, data.filePath)
		const resolvedSpec = resolveSpec(specPath, dirname(markdownFile))

		// Don't re-process if we have it in cache.
		if (!openApiSpecCache.has(resolvedSpec)) {
			const { schema } = await loadSpec(resolvedSpec)
			const sidebar = getSidebarItems(schema, `/${data.relativePath}`)
			openApiSpecCache.set(resolvedSpec, { schema, sidebar })

			// TODO: hack together something to watch all local files read.
			// We can probably exploit the fact the transform hook of the Vite plugin will run after this.
		}

		// ctx.schema = openApiSpecCache.get(resolvedSpec)!
		const spec = openApiSpecCache.get(resolvedSpec)!
		return {
			openapi: { type: 'local', spec: spec.schema } satisfies OpenApiPageData,
			sidebar: spec.sidebar,
		}
	}

	return {
		name: 'vitepress-scalar:openapi',
		config (cfg) {
			const siteConfig = (cfg as any).vitepress as SiteConfig
			const userTransformPageData = siteConfig.transformPageData

			// Doing it at this stage feels like an ugly hack, but it actually is the best moment to update page data
			// It runs as part of the `transform` hook, which means it happens at a coherent time in the build pipeline
			siteConfig.transformPageData = async (data, ctx) => {
				if (data.frontmatter['layout'] === 'openapi') {
					const res = await transformPageData(data, ctx)
					if (res) data = { ...data, ...res }

					const userRes = await userTransformPageData?.(data, ctx)
					return userRes ? { ...res, ...userRes } : res
				}

				return
			}
		},
	}
}

// Augment vitepress
declare module 'vitepress' {
	interface PageData {
		openapi?: OpenApiPageData
	}
}
