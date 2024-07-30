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

<script setup>
import { useData } from 'vitepress'
import { useSidebar } from 'vitepress/theme'

import { ApiReference } from '@scalar/api-reference'
import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue'
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue'
import VPLocalNav from 'vitepress/dist/client/theme-default/components/VPLocalNav.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'

import '@scalar/api-reference/style.css'
import '../styles/colors.css'
import '../styles/sidebar.css'
import '../styles/intro.css'
import '../styles/vp-fixes.css'

const { isDark } = useData()
const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar()
</script>

<template>
	<VPSkipLink />
	<VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />

	<VPNav class="openapi-nav" />
	<VPLocalNav :open="isSidebarOpen" @open-menu="openSidebar" />

	<div class="openapi-spec-wrapper" :class="{ 'sidebar-open': isSidebarOpen }">
		<ApiReference
			:configuration="{
				darkMode: isDark,
				spec: {
					url: 'https://cdn.jsdelivr.net/npm/@scalar/galaxy/dist/latest.yaml',
				},
			}"
		/>
	</div>

	<VPFooter />
</template>
