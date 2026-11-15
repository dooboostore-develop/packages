package io.dooboostore.swc

import com.intellij.lang.parameterInfo.CreateParameterInfoContext
import com.intellij.lang.parameterInfo.ParameterInfoContext
import com.intellij.lang.parameterInfo.ParameterInfoHandler
import com.intellij.lang.parameterInfo.ParameterInfoUIContext
import com.intellij.lang.parameterInfo.UpdateParameterInfoContext
import com.intellij.psi.PsiElement
import org.eclipse.lsp4j.SignatureHelp
import org.eclipse.lsp4j.SignatureHelpParams
import org.eclipse.lsp4j.SignatureInformation

/** 템플릿(주입된 HTML) 안 Cmd+P — `$host.pick(1, |)` → pick(name: string, count: number) */
class SwcParameterInfoHandler : ParameterInfoHandler<PsiElement, SignatureInformation> {
    private fun help(context: ParameterInfoContext): SignatureHelp? {
        val element = context.file.findElementAt(context.offset) ?: context.file.findElementAt(context.offset - 1) ?: return null
        val at = hostPosition(element, context.offset, context.editor) ?: return null
        return runCatching {
            at.client.sendRequestSync(REQUEST_TIMEOUT_MS) { it.textDocumentService.signatureHelp(SignatureHelpParams(at.document, at.position)) }
        }.getOrNull()?.takeIf { it.signatures.isNotEmpty() }
    }

    override fun findElementForParameterInfo(context: CreateParameterInfoContext): PsiElement? {
        val help = help(context) ?: return null
        context.itemsToShow = help.signatures.toTypedArray()
        return context.file.findElementAt(context.offset) ?: context.file
    }

    override fun showParameterInfo(element: PsiElement, context: CreateParameterInfoContext) = context.showHint(element, context.offset, this)

    override fun findElementForUpdatingParameterInfo(context: UpdateParameterInfoContext): PsiElement? {
        val help = help(context) ?: return null
        context.setCurrentParameter(help.activeParameter ?: help.signatures[help.activeSignature ?: 0].activeParameter ?: 0)
        return context.parameterOwner
    }

    override fun updateParameterInfo(element: PsiElement, context: UpdateParameterInfoContext) {}

    override fun updateUI(signature: SignatureInformation, context: ParameterInfoUIContext) {
        val label = signature.label
        val range = signature.parameters?.getOrNull(context.currentParameterIndex)?.label?.let { p ->
            if (p.isLeft) label.indexOf(p.left).takeIf { it >= 0 }?.let { it to it + p.left.length }
            else p.right.first to p.right.second
        }
        context.setupUIComponentPresentation(label, range?.first ?: -1, range?.second ?: -1, false, false, false, context.defaultParameterColor)
    }
}
