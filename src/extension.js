import { registerFileListHeader } from '@nextcloud/files'
import { generateUrl } from '@nextcloud/router'
import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import java from 'highlight.js/lib/languages/java'
import python from 'highlight.js/lib/languages/python'
import './readme-header.css'
import { subscribe } from '@nextcloud/event-bus'

const APP_ID = 'markdownreadme'
const HEADER_ID = `${APP_ID}-readme-header`

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)

// Keep track of the currently displayed folder
let lastFolder = null
let refreshTimer = null

// Supported README filename variants
const README_CANDIDATES = new Set([
	'README.md', 'Readme.md', 'readme.md', 'README.MD', 'ReadMe.md', 'README', 'Readme', 'readme', 
	'.README.md', '.Readme.md', '.readme.md', '.README.MD', '.ReadMe.md', '.README', '.Readme', '.readme',
])

// Debounced refresh to avoid multiple rapid reloads
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
md.use(markdownItTaskLists, {
	enabled: false,
	label: true,
	labelAfter: true,
})

const renderMarkdown = (content) => {
	const html = md.render(content)
	const template = document.createElement('template')
	template.innerHTML = html

	template.content.querySelectorAll('input.task-list-item-checkbox').forEach((input) => {
		const marker = document.createElement('span')
		marker.className = 'markdownreadme-task-box'
		if (input.checked || input.hasAttribute('checked')) {
			marker.classList.add('checked')
		}
		input.replaceWith(marker)
	})

	return template.innerHTML
}

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

const showPanel = (panel) => {panel.classList.remove('hidden')}

const hidePanel = (panel) => {panel.classList.add('hidden')}

const showMessage = (panel, message) => {
	showPanel(panel)
	const body = panel.querySelector('.markdownreadme-body')
	if (body) {
		body.innerHTML = `<p class="markdownreadme-muted">${md.utils.escapeHtml(message)}</p>`
	}
}

const setBodyHtml = (panel, html) => {
	const body = panel.querySelector('.markdownreadme-body')
	if (body) body.innerHTML = html
}

const setTitle = (panel, title) => {
	const h2 = panel.querySelector('.markdownreadme-header h2')
	if (h2) h2.textContent = title
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
	body.innerHTML = renderMarkdown(content)
}

const fetchReadme = async (panel, folder) => {
	if (!folder) {
		hidePanel(panel)
		return
	}

	const path = toUserPath(folder)
	const requestId = ++requestCounter

	// Default: hidden -> kein Flackern in Ordnern ohne README
	hidePanel(panel)

	try {
		const apiUrl = new URL(generateUrl('/apps/markdownreadme/api/readme'), window.location.origin)
		apiUrl.searchParams.set('path', path)

		const response = await fetch(apiUrl.toString(), {
			headers: { Accept: 'application/json' },
			credentials: 'same-origin',
		})

		if (requestId !== requestCounter) return

		if (!response.ok) {
			hidePanel(panel)
			return
		}

		const data = await response.json()

		// Kein README? -> hidden lassen, keine Message
		if (!data?.exists || !data?.content) {
			hidePanel(panel)
			return
		}

		// README gefunden -> jetzt erst anzeigen + füllen
		setTitle(panel, data.name || 'README')
		setBodyHtml(panel, renderMarkdown(String(data.content)))
		showPanel(panel)
	} catch (error) {
		if (requestId !== requestCounter) return
		hidePanel(panel)
		console.error('[markdownreadme] README fetch failed', error)
	}
}

const createPanel = () => {
	const panel = document.createElement('section')
	panel.className = 'markdownreadme-panel hidden'
	panel.innerHTML = `
		<div class="markdownreadme-body"></div>
	`
	return panel
}

registerFileListHeader({
	id: HEADER_ID,
	order: 100,
	enabled: () => true,
	render(el, folder) {
		console.log('[markdownreadme] header render', folder?.path)
		lastFolder = folder
		el.innerHTML = ''
		rootElement = createPanel()
		el.appendChild(rootElement)
		void fetchReadme(rootElement, folder)
	},
	updated(folder) {
		lastFolder = folder
		console.log('[markdownreadme] header updated', folder?.path)
		if (!rootElement) return
		void fetchReadme(rootElement, folder)
	},
})

const scheduleRefresh = () => {
	if (!rootElement || !lastFolder) return
	clearTimeout(refreshTimer)
	refreshTimer = setTimeout(() => {
		void fetchReadme(rootElement, lastFolder)
	}, 150)
}

// Check whether the changed node is a README file
// and belongs to the currently visible folder
const isReadmeInCurrentFolder = (node) => {
	const nodePath = String(node?.path ?? '')
	const name = nodePath.split('/').pop()
	if (!name || !README_CANDIDATES.has(name)) return false

	const currentDir = toUserPath(lastFolder)
	const expectedPrefix = currentDir === '/' ? '/' : `${currentDir}/`
	return nodePath.startsWith(expectedPrefix)
}

// Listen to file events and refresh the README
// when a relevant file is created, updated, moved, or deleted
;['files:node:created', 'files:node:moved', 'files:node:deleted', 'files:node:updated'].forEach((evt) => {
	subscribe(evt, (node) => {
		try {
			if (!lastFolder) return
			if (!isReadmeInCurrentFolder(node)) return
			scheduleRefresh()
		} catch (e) {
			// Silently ignore unexpected errors
		}
	})
})



console.log('[markdownreadme] file list header registered')
