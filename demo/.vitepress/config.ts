import { defineConfig } from 'vitepress'
import { withScalar } from '../../src/config.js' // In a real project: vitepress-scalar/config

// https://vitepress.dev/reference/site-config
export default withScalar(
	defineConfig({
		title: 'VitePress Scalar Demo',
		description: 'Demo docs with Scalar',
		themeConfig: {
			// https://vitepress.dev/reference/default-theme-config
			nav: [
				{ text: 'Home', link: '/' },
				{ text: 'API Reference', link: '/api-reference' },
			],

			sidebar: [
				{
					text: 'Examples',
					items: [
						{ text: 'Markdown Examples', link: '/markdown-examples' },
						{ text: 'API Reference', link: '/api-reference' },
					],
				},
				{
					text: 'Test1',
					collapsed: false,
					items: [
						{ text: 'Markdown Examples', link: '/markdown-examples' },
						{ text: 'API Reference', link: '/api-reference' },
						{
							text: 'Test2',
							collapsed: false,
							items: [
								{ text: 'Markdown Examples', link: '/markdown-examples' },
								{ text: 'API Reference', link: '/api-reference' },
								{
									text: 'Test3',
									collapsed: false,
									items: [
										{ text: 'Markdown Examples', link: '/markdown-examples' },
										{ text: 'API Reference', link: '/api-reference' },
									],
								},
							],
						},
					],
				},
			],

			socialLinks: [
				{ icon: 'github', link: 'https://github.com/cyyynthia/vitepress-scalar' },
			],

			search: {
				provider: 'local',
			},
		},
	}),
)
