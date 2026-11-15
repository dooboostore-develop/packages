package io.dooboostore.swc

import com.intellij.codeInsight.navigation.actions.GotoDeclarationHandler
import com.intellij.openapi.editor.Editor
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiManager
import org.eclipse.lsp4j.DefinitionParams

/** 템플릿(주입된 HTML) 안 Cmd+클릭 / Cmd+B — `$host.onClick`, `<demo-tag>`, `@state@` → 선언 */
class SwcGotoDeclarationHandler : GotoDeclarationHandler {
    override fun getGotoDeclarationTargets(sourceElement: PsiElement?, offset: Int, editor: Editor?): Array<PsiElement>? {
        val at = sourceElement?.let { hostPosition(it, offset, editor) } ?: return null
        val result = runCatching {
            at.client.sendRequestSync(REQUEST_TIMEOUT_MS) { it.textDocumentService.definition(DefinitionParams(at.document, at.position)) }
        }.getOrNull() ?: return null
        val targets = if (result.isLeft) result.left.map { it.uri to it.range.start } else result.right.map { it.targetUri to it.targetSelectionRange.start }
        val psiManager = PsiManager.getInstance(sourceElement.project)
        return targets.mapNotNull { (uri, start) ->
            val file = at.client.descriptor.findFileByUri(uri)?.let(psiManager::findFile) ?: return@mapNotNull null
            file.offsetOf(start)?.let(file::findElementAt) ?: file
        }.toTypedArray().takeIf { it.isNotEmpty() }
    }
}

internal const val REQUEST_TIMEOUT_MS = 3000
