package io.dooboostore.swc.lsp

import com.intellij.openapi.editor.DefaultLanguageHighlighterColors
import com.intellij.openapi.editor.HighlighterColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.diagnostic.Logger
import com.intellij.psi.PsiFile
import com.intellij.platform.lsp.api.customization.LspSemanticTokensSupport
import org.eclipse.lsp4j.SemanticTokenTypes

private val LOG = Logger.getInstance("SwcSemanticTokensCustomizer")

/**
 * Enables LSP semantic-token highlighting for TypeScript/JavaScript files.
 *
 * IntelliJ's default [LspSemanticTokensSupport.shouldAskServerForSemanticTokens] turns the
 * server off for any language with PSI (JS/TS included). SWC template syntax (`{{ }}`, `@var@`,
 * `swc-on-*`, `ea:`) is not part of the JS/TS PSI, so we must ask the server anyway and map the
 * token types to the standard IDEA attributes.
 */
class SwcSemanticTokensCustomizer : LspSemanticTokensSupport() {

    override fun shouldAskServerForSemanticTokens(psiFile: PsiFile): Boolean {
        // Always ask the server when the file is a JS/TS-family file we've claimed.
        val langId = psiFile.language.id
        LOG.info("shouldAskServerForSemanticTokens langId=${langId} file=${psiFile.name}")
        return langId == "typescript" || langId == "JavaScript" ||
            langId == "TEXT" || langId == "textmate"
    }

    override fun getTextAttributesKey(tokenType: String, modifiers: List<String>): TextAttributesKey? {
        return when (tokenType) {
            SemanticTokenTypes.Variable -> DefaultLanguageHighlighterColors.LOCAL_VARIABLE
            SemanticTokenTypes.Property -> DefaultLanguageHighlighterColors.INSTANCE_FIELD
            SemanticTokenTypes.Keyword -> DefaultLanguageHighlighterColors.KEYWORD
            SemanticTokenTypes.Function ->
                if (modifiers.contains("declaration")) DefaultLanguageHighlighterColors.FUNCTION_DECLARATION
                else DefaultLanguageHighlighterColors.FUNCTION_CALL
            SemanticTokenTypes.Macro -> DefaultLanguageHighlighterColors.KEYWORD
            SemanticTokenTypes.String -> DefaultLanguageHighlighterColors.STRING
            else -> HighlighterColors.TEXT
        }
    }
}