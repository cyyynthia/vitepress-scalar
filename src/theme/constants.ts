/*!
 * https://github.com/scalar/scalar/blob/2f6180a1b4ee99b3f5ddc3129e8ddf35ad2e396b/packages/api-reference/src/components/HttpMethod/constants.ts
 * Copyright (c) 2023-present Scalar
 * SPDX-License-Identifier: MIT
 */

export const validRequestMethods = [
	'GET',
	'POST',
	'PUT',
	'HEAD',
	'DELETE',
	'PATCH',
	'OPTIONS',
	'CONNECT',
	'TRACE',
] as const

export type RequestMethod = (typeof validRequestMethods)[number]

export const requestMethodColors: { [x in RequestMethod]: string } = {
	POST: 'var(--scalar-color-green)',
	DELETE: 'var(--scalar-color-red)',
	PATCH: 'var(--scalar-color-yellow)',
	GET: 'var(--scalar-color-blue)',
	PUT: 'var(--scalar-color-orange)',
	OPTIONS: 'var(--scalar-color-purple)',
	HEAD: 'var(--scalar-color-2)',
	CONNECT: 'var(--scalar-color-2)',
	TRACE: 'var(--scalar-color-2)',
}

export const requestMethodAbbreviations: { [x in RequestMethod]: string } = {
	POST: 'POST',
	DELETE: 'DEL',
	PATCH: 'PATCH',
	GET: 'GET',
	PUT: 'PUT',
	OPTIONS: 'OPTS',
	HEAD: 'HEAD',
	CONNECT: 'CONN',
	TRACE: 'TRACE',
}
