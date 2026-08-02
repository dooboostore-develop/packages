package io.dooboostore.swc.lsp

import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.editor.event.EditorFactoryEvent
import com.intellij.openapi.editor.event.EditorFactoryListener
import com.intellij.openapi.editor.markup.HighlighterLayer
import com.intellij.openapi.editor.markup.HighlighterTargetArea
import com.intellij.openapi.editor.markup.RangeHighlighter
import com.intellij.openapi.editor.markup.TextAttributes
import com.intellij.psi.PsiDocumentManager
import com.intellij.psi.PsiFile
import java.awt.Font
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.WeakHashMap

/**
 * Paints SWC template markers directly into the editor markup model.
 *
 * SWC markers (`@var@`, `{{ }}`, `swc-on-*`, `ea:`) live inside JS template strings, so the
 * TypeScript highlighter colors the whole backtick block as a string and neither LSP semantic
 * tokens nor a plain Annotator can override that. This listener runs for every editor opened on a
 * claimed file, invokes the server's `highlight.js` over the current text, and adds range
 * highlighters on the `ADDITIONAL_SYNTAX` layer so they always win over the string color.
 * Highlights recompute on document changes and are disposed when the editor is released.
 */
class SwcHighlightingListener : EditorFactoryListener {

    // editor -> its active SWC range highlighters (WeakHashMap so released editors are GC'd)
    private val highlightersByEditor = java.util.concurrent.ConcurrentHashMap<Editor, MutableList<RangeHighlighter>>()

    private val tokenColors = mapOf(
        "variable" to java.awt.Color(55, 118, 171),   // blue: @var@ refs
        "keyword" to java.awt.Color(180, 88, 0),      // orange: {{ }} markers
        "function" to java.awt.Color(0, 110, 130),    // teal: swc-on-*
        "macro" to java.awt.Color(120, 60, 160),      // purple: ea:
        "string" to java.awt.Color(140, 140, 140),    // gray: other template-ish tokens
    )

    private val boldTokens = setOf("keyword")

    override fun editorCreated(event: EditorFactoryEvent) {
        val editor = event.editor
        val project = editor.project ?: return
        val vFile = (PsiDocumentManager.getInstance(project).getPsiFile(editor.document) as? PsiFile)?.virtualFile ?: return
        if (vFile.extension !in SwcLspClientDescriptor.CANDIDATE_EXTENSIONS) return

        editor.document.addDocumentListener(object : DocumentListener {
            override fun documentChanged(event: DocumentEvent) {
                refresh(editor)
            }
        })
        refresh(editor)
    }

    override fun editorReleased(event: EditorFactoryEvent) {
        val editor = event.editor
        highlightersByEditor.remove(editor)?.forEach { it.dispose() }
    }

    private fun refresh(editor: Editor) {
        val doc = editor.document
        val text = doc.text

        val next = ArrayList<RangeHighlighter>()
        for (t in compute(text)) {
            if (t.length <= 0 || t.line >= doc.lineCount) continue
            val start = doc.getLineStartOffset(t.line) + t.col
            val end = start + t.length
            if (start < 0 || end > text.length) continue
            val color = tokenColors[t.token] ?: continue
            val attrs = TextAttributes()
            attrs.foregroundColor = color
            if (t.token in boldTokens) attrs.fontType = Font.BOLD
            val rh = editor.markupModel.addRangeHighlighter(
                start, end,
                HighlighterLayer.ADDITIONAL_SYNTAX,
                attrs,
                HighlighterTargetArea.EXACT_RANGE,
            )
            next.add(rh)
        }

        // Replace previously-painted highlighters for this editor.
        highlightersByEditor.remove(editor)?.forEach { it.dispose() }
        highlightersByEditor[editor] = next
    }

    private fun compute(text: String): List<SwToken> {
        val highlightJs = SwcServerPath.resolveHighlightJs() ?: return emptyList()
        if (!Files.isRegularFile(highlightJs)) return emptyList()
        return try {
            val p = ProcessBuilder("node", highlightJs.toString()).start()
            p.outputStream.use { it.write(text.toByteArray(StandardCharsets.UTF_8)) }
            val out = p.inputStream.use { it.readBytes().toString(StandardCharsets.UTF_8) }
            p.waitFor()
            parse(out)
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun parse(stdout: String): List<SwToken> {
        val re = Regex("\"line\":(\\d+),\"col\":(\\d+),\"length\":(\\d+),\"token\":\"([a-z]+)\"")
        return re.findAll(stdout).map { m ->
            SwToken(m.groupValues[1].toInt(), m.groupValues[2].toInt(), m.groupValues[3].toInt(), m.groupValues[4])
        }.toList()
    }

    data class SwToken(val line: Int, val col: Int, val length: Int, val token: String)
}