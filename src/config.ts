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

import { type DefaultTheme, mergeConfig, type UserConfig } from 'vitepress'
import { createThemePlugin } from './plugins/theme.js'
import { createScalarEsbuildPlugin } from './plugins/scalar.js'

export type ScalarThemeConfig = {
	scalar?: {}
}

export function withScalar (config: UserConfig<ScalarThemeConfig>): UserConfig<ScalarThemeConfig> {
	const scalarConfig: UserConfig<DefaultTheme.Config> = {
		vite: {
			plugins: [
				{
					name: 'vitepress-scalar:experimental-warn',
					configResolved (config) {
						;(config as any).vitepress.logger.warn('VitePress-Scalar: this vitepress addon is highly experimental and is not ready for production use at this time. Breaking changes can and will happen. Use at your own risk!')
					},
				},
				createThemePlugin(),
			],
			optimizeDeps: {
				esbuildOptions: {
					plugins: [
						createScalarEsbuildPlugin(),
					],
				},
			},
		},
	}

	return mergeConfig(config, scalarConfig, true)
}

declare module 'vitepress' {
	namespace DefaultTheme {
		interface Config {
			scalar?: ScalarThemeConfig
		}
	}
}
