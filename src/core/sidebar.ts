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

import type { DefaultTheme } from 'vitepress'
import type { OpenAPI } from '@scalar/openapi-parser'
import { type SidebarEntry, useSidebar } from '@scalar/api-reference'

import {
	type RequestMethod,
	requestMethodAbbreviations,
	requestMethodColors,
	validRequestMethods,
} from '../theme/constants.js'

function isVerb (verb: string): verb is RequestMethod {
	return validRequestMethods.includes(verb as any)
}

function escape (str: string) {
	return str.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function createSidebarItem (entry: SidebarEntry) {
	const titleRaw = escape(entry.displayTitle ?? entry.title ?? entry.id)
	const title = entry.deprecated ? `<s>${titleRaw}</s>` : titleRaw

	// https://github.com/scalar/scalar/blob/2f6180a1b4ee99b3f5ddc3129e8ddf35ad2e396b/packages/api-reference/src/components/HttpMethod/HttpMethod.vue#L19-L30
	if (!entry.httpVerb) return title
	const verb = entry.httpVerb.trim().toUpperCase()
	const verbShort = isVerb(verb) ? requestMethodAbbreviations[verb] : verb.slice(0, 4)
	const verbColor = isVerb(verb) ? requestMethodColors[verb] : 'var(--scalar-color-ghost)'

	// @formatter:off
	return '' +
		'<div class="VPScalarSidebarItem">' +
			`<span class="VPScalarSidebarItemText">${title}</span>` +
			`<span class="VPScalarSidebarHttpVerb" style="--method-color: ${verbColor}">${verbShort}</span>` +
		'</div>'
	// @formatter:on
}

function transformEntry (entry: SidebarEntry, path?: string): DefaultTheme.SidebarItem {
	return {
		// hack: vp fails to recognize active links otherwise :shrug:
		link: `${path ?? ''}#${entry.id}`,
		text: createSidebarItem(entry),
		collapsed: false,
		items: entry.children?.map((c) => transformEntry(c, path)) ?? [],
	}
}

export function getSidebarItems (spec: OpenAPI.Document, path?: string): DefaultTheme.SidebarItem[] {
	// It would be better to not use the composable, but Scalar's sidebar logic is embedded in it.
	// Makes total sense given the base implementation, probably doesn't expect to be split apart this way.
	const { items } = useSidebar({ parsedSpec: spec })
	return items.value.entries.map((c) => transformEntry(c, path))
}
