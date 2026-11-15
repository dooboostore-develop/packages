package io.dooboostore.swc

import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors as C
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.util.TextRange
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile

/** SWC 문법 색칠 — VS Code 의 syntaxes/swc.injection.json 과 같은 규칙. 템플릿 문자열 속 HTML 과 .html 파일에 붙는다 */
class SwcAnnotator : Annotator {
    private val rules: List<Pair<Regex, List<TextAttributesKey?>>> = listOf(
        Regex("""(<!--\[\[)\s*([^\]]*?)\s*(\]\]-->)""") to listOf(C.KEYWORD, C.METADATA, C.KEYWORD), // <!--[[ slot ]]-->
        Regex("""(<!--\[)(html|text)\b""") to listOf(C.KEYWORD, C.KEYWORD), // <!--[html expr ]-->
        Regex("""(\]-->)""") to listOf(C.KEYWORD),
        Regex("""(swc-on-[\w-]+)\s*=""") to listOf(C.METADATA), // swc-on-click="…"
        Regex("""(\{\{=)|(\}\})""") to listOf(C.KEYWORD, C.KEYWORD), // {{= expr }}
        Regex("""(?<=\s)([aep])(::)([\w-]*)""") to listOf(C.KEYWORD, C.KEYWORD, C.METADATA), // a::title
        Regex("""(?<![\w@$.])(@)([A-Za-z_$][\w$.]*)(@)""") to listOf(C.KEYWORD, C.INSTANCE_FIELD, C.KEYWORD), // @state@
        Regex("""(\$(?:this|host|parentHost|hosts|firstHost|lastHost|appHost|appHosts|firstAppHost|lastAppHost|d|w|q|qa|qi|el|root|event|data|detail))\b""") to listOf(C.PREDEFINED_SYMBOL),
    )

    override fun annotate(element: PsiElement, holder: AnnotationHolder) {
        val file = element.parent as? PsiFile ?: return
        if (element.prevSibling != null) return // 파일마다 한 번 (첫 최상위 요소에서 파일 전체를)
        val text = file.text
        val base = 0
        for ((regex, keys) in rules) for (m in regex.findAll(text)) keys.forEachIndexed { i, key ->
            val g = m.groups[i + 1] ?: return@forEachIndexed
            if (key != null && !g.range.isEmpty()) holder.newSilentAnnotation(HighlightSeverity.INFORMATION)
                .range(TextRange(base + g.range.first, base + g.range.last + 1)).textAttributes(key).create()
        }
    }
}
