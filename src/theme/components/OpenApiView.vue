<!--
	Copyright (c) Cynthia Rey, All rights reserved.
	SPDX-License-Identifier: BSD-3-Clause

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer.
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the
	   documentation and/or other materials provided with the distribution.
	3. Neither the name of the copyright holder nor the names of its contributors
	   may be used to endorse or promote products derived from this software without
	   specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
-->

<script setup lang="ts">
import type { OpenAPI } from '@scalar/openapi-parser'

import { onBeforeMount, onBeforeUnmount, watch, triggerRef } from 'vue'
import { DefaultTheme, useData } from 'vitepress'
import { useSidebar } from 'vitepress/theme'

import { ApiReferenceLayout } from '@scalar/api-reference'
import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue'
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue'
import VPLocalNav from 'vitepress/dist/client/theme-default/components/VPLocalNav.vue'
import VPSidebar from 'vitepress/dist/client/theme-default/components/VPSidebar.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'

import '@scalar/api-reference/style.css'
import '../styles/colors.css'
import '../styles/sidebar.css'
import '../styles/intro.css'
import '../styles/vp-fixes.css'

const { isDark, site, hash } = useData()
const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar()

const props = defineProps<{ spec: OpenAPI.Document, sidebar: DefaultTheme.SidebarItem[] }>()

function handleReplaceState () {
	// exposed hash is a ro computed view of the actual ref... >:)
	;(hash as any)._value = location.hash
	triggerRef(hash)
}

// May the moron who decided that hashchange doesn't always fire burn in hell. (see note on step 8)
// https://html.spec.whatwg.org/multipage/browsing-the-web.html#url-and-history-update-steps
const _replaceState = history.replaceState
onBeforeMount(() => history.replaceState = (...args) => (_replaceState.apply(history, args), handleReplaceState()))
onBeforeUnmount(() => history.replaceState = _replaceState)

// Hack to inject the sidebar we want. It's ugly, but it does the trick...
let vpSidebar: DefaultTheme.SidebarItem[]
onBeforeMount(() => {
	site.value.themeConfig ??= {}
	site.value.themeConfig.sidebar ??= []

	vpSidebar = [ ...site.value.themeConfig.sidebar ]

	watch(
		() => props.sidebar,
		() => (site.value.themeConfig.sidebar = props.sidebar),
		{ immediate: true },
	)
})

onBeforeUnmount(() => {
	site.value.themeConfig.sidebar = vpSidebar
})
</script>

<template>
	<VPSkipLink />
	<VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />

	<VPNav class="openapi-nav" />
	<VPLocalNav :open="isSidebarOpen" @open-menu="openSidebar" />

	<VPSidebar :open="isSidebarOpen" class="VPScalarSidebar" />

	<div
		class="VPDoc openapi-spec-wrapper"
		:class="{ 'light-mode': !isDark, 'dark-mode': isDark }"
	>
		<ApiReferenceLayout
			:parsedSpec="spec"
			:rawSpec="JSON.stringify(spec, null, '\t')"
			:configuration="{
				showSidebar: false,
				withDefaultFonts: false,
				defaultOpenAllTags: true,
			}"
		/>
	</div>

	<VPFooter />
</template>
