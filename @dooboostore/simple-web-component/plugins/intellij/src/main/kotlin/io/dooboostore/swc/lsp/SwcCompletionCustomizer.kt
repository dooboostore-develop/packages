package io.dooboostore.swc.lsp

import com.intellij.codeInsight.completion.CompletionParameters
import com.intellij.platform.lsp.api.customization.LspCompletionSupport

/**
 * Fine-tunes LSP completion behaviour for SWC template syntax.
 *
 * IntelliJ filters LSP completion items against a "completion prefix" (the identifier text
 * immediately before the caret). Inside a backtick template, expressions like `@name@.` and
 * `{{ name }}` produce a default JS/TS prefix IntelliJ cannot infer correctly, which causes the
 * server's items to be filtered out. We disable the IDE-side prefix filtering entirely and let the
 * LSP server (which knows the SWC grammar) do all the matching.
 */
class SwcCompletionCustomizer : LspCompletionSupport() {

    override fun getCompletionPrefix(parameters: CompletionParameters, defaultPrefix: String): String {
        return ""
    }
}