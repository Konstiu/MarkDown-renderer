import { defineComponent, ref, watch, h } from 'vue'
import { registerFileListFooter } from '@nextcloud/files'
import { generateUrl } from '@nextcloud/router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// Configure markdown-it with syntax highlighting
const md = new MarkdownIt({
    html: false,       // Disable raw HTML for security (XSS prevention)
    linkify: true,
    typographer: true,
    highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>'
                    + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
                    + '</code></pre>'
            } catch (_) { /* fall through to default */ }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    },
})

const ReadmeFooter = defineComponent({
    name: 'ReadmeFooter',

    props: {
        // NC33 FileList footer API passes the current Folder node here
        currentFolder: {
            type: Object,
            default: null,
        },
    },

    setup(props) {
        const htmlContent = ref('')
        const isLoading = ref(false)

        async function fetchReadme(folder) {
            if (!folder) {
                htmlContent.value = ''
                return
            }

            // NC33: folder.path is the WebDAV path e.g. "/admin/files/MyFolder"
            // Strip the /userId/files prefix to get the relative user path
            const rawPath = folder.path ?? '/'
            const match = rawPath.match(/^\/[^/]+\/files(\/.*)?$/)
            const userPath = match ? (match[1] ?? '/') : rawPath

            isLoading.value = true
            htmlContent.value = ''

            try {
                // Use @nextcloud/router for correct URL generation in NC33
                const apiUrl = generateUrl('/apps/markdownreadme/api/readme')
                const url = new URL(apiUrl, window.location.origin)
                url.searchParams.set('path', userPath)

                const response = await fetch(url.toString(), {
                    headers: { 'Accept': 'application/json' },
                })

                if (!response.ok) {
                    htmlContent.value = ''
                    return
                }

                const data = await response.json()
                htmlContent.value = data.exists ? md.render(data.content) : ''

            } catch (error) {
                console.error('[markdownreadme] Failed to fetch README:', error)
                htmlContent.value = ''
            } finally {
                isLoading.value = false
            }
        }

        watch(() => props.currentFolder, fetchReadme, { immediate: true })

        return () => {
            if (!htmlContent.value) {
                return null
            }

            return h('div', {
                class: 'readme-footer',
                innerHTML: htmlContent.value,
            })
        }
    },
})

// Register footer — NC33 stable API
registerFileListFooter({
    id: 'markdownreadme',
    component: ReadmeFooter,
})
