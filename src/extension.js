import { Header, registerFileListHeaders } from '@nextcloud/files'
import { generateUrl } from '@nextcloud/router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import './readme-header.css'

const APP_ID = 'markdownreadme'
const HEADER_ID = `${APP_ID}-readme-header`

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
	highlight(str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
			} catch {
				// fall through
			}
		}
		return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
	},
})

let rootElement = null
let requestCounter = 0

const toUserPath = (folder) => {
	const rawPath = String(folder?.path ?? '/').trim()
	if (!rawPath || rawPath === '/') {
		return '/'
	}

	const normalized = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
	const match = normalized.match(/^\/(?:[^/]+\/)?files(\/.*)?$/)
	if (match) {
		return match[1] ?? '/'
	}

	return normalized
}

const showPanel = (panel) => {
	panel.classList.remove('hidden')
}

const hidePanel = (panel) => {
	panel.classList.add('hidden')
}

const showMessage = (panel, message) => {
	showPanel(panel)
	const body = panel.querySelector('.markdownreadme-body')
	if (body) {
		body.innerHTML = `<p class="markdownreadme-muted">${md.utils.escapeHtml(message)}</p>`
	}
}

const showLoading = (panel) => {
	showMessage(panel, 'Loading README...')
}

const showReadme = (panel, content) => {
	showPanel(panel)
	const body = panel.querySelector('.markdownreadme-body')
	if (!body) {
		return
	}
	body.innerHTML = md.render(content)
}

const fetchReadme = async (panel, folder) => {
	if (!folder) {
		hidePanel(panel)
		return
	}

	const path = toUserPath(folder)
	const requestId = ++requestCounter
	showLoading(panel)

	try {
		const apiUrl = new URL(generateUrl('/apps/markdownreadme/api/readme'), window.location.origin)
		apiUrl.searchParams.set('path', path)

		const response = await fetch(apiUrl.toString(), {
			headers: { Accept: 'application/json' },
			credentials: 'same-origin',
		})

		if (requestId !== requestCounter) {
			return
		}

		if (!response.ok) {
			showMessage(panel, 'Could not load README.')
			return
		}

		const data = await response.json()
		if (!data?.exists || !data?.content) {
			showMessage(panel, 'No README.md in this folder.')
			return
		}

		showReadme(panel, String(data.content))
	} catch (error) {
		if (requestId !== requestCounter) {
			return
		}
		showMessage(panel, 'Could not load README.')
		console.error('[markdownreadme] README fetch failed', error)
	}
}

const createPanel = () => {
	const panel = document.createElement('section')
	panel.className = 'markdownreadme-panel hidden'
	panel.innerHTML = `
		<header class="markdownreadme-header">
			<h2>README</h2>
		</header>
		<div class="markdownreadme-body"></div>
	`
	return panel
}

registerFileListHeaders(new Header({
	id: HEADER_ID,
	order: 100,
	enabled: () => true,
	render(el, folder) {
		console.log('[markdownreadme] header render', folder?.path)
		el.innerHTML = ''
		rootElement = createPanel()
		el.appendChild(rootElement)
		void fetchReadme(rootElement, folder)
	},
	updated(folder) {
		console.log('[markdownreadme] header updated', folder?.path)
		if (!rootElement) {
			return
		}
		void fetchReadme(rootElement, folder)
	},
}))

console.log('[markdownreadme] file list header registered')
