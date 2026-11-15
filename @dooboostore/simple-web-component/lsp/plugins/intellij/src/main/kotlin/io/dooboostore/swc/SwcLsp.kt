package io.dooboostore.swc

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.javascript.nodejs.interpreter.NodeJsInterpreterManager
import com.intellij.javascript.nodejs.interpreter.local.NodeJsLocalInterpreter
import com.intellij.lang.injection.InjectedLanguageManager
import com.intellij.openapi.diagnostic.logger
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.util.EnvironmentUtil
import com.intellij.platform.lsp.api.LspClient
import com.intellij.platform.lsp.api.LspClientManager
import com.intellij.platform.lsp.api.LspIntegrationProvider
import com.intellij.platform.lsp.api.ProjectWideLspClientDescriptor
import com.intellij.psi.PsiDocumentManager
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.TextDocumentIdentifier
import java.io.File

private val LOG = logger<SwcLspIntegrationProvider>()

// 서버는 플러그인에 넣지 않는다 — 프로젝트에 설치된 @dooboostore/simple-web-component 안의 것을 쓴다 (VS Code 확장과 같다)
private const val SERVER_IN_PROJECT = "node_modules/@dooboostore/simple-web-component/lsp/out/server/server.js"
private val EXTENSIONS = setOf("ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs", "html")

class SwcLspIntegrationProvider : LspIntegrationProvider {
    override fun fileOpened(project: Project, file: VirtualFile, clientStarter: LspIntegrationProvider.LspClientStarter) {
        if (file.extension !in EXTENSIONS) return
        val server = findServer(project) ?: return LOG.info("swc-lsp: $SERVER_IN_PROJECT not found under ${project.basePath}")
        clientStarter.ensureClientStarted(SwcLspClientDescriptor(project, server))
    }
}

class SwcLspClientDescriptor(project: Project, private val server: File) : ProjectWideLspClientDescriptor(project, "Simple Web Component") {
    override fun isSupportedFile(file: VirtualFile) = file.extension in EXTENSIONS

    override fun createCommandLine() = GeneralCommandLine(node(project), server.path, "--stdio").withWorkDirectory(project.basePath)
}

/** 프로젝트 폴더와 그 상위 → 하위 폴더(모노레포, 깊이 3)의 node_modules */
private fun findServer(project: Project): File? {
    val base = project.basePath?.let(::File) ?: return null
    generateSequence(base) { it.parentFile }.map { File(it, SERVER_IN_PROJECT) }.firstOrNull { it.isFile }?.let { return it }
    return base.walkTopDown().maxDepth(3)
        .onEnter { it.name != "node_modules" && !it.name.startsWith(".") }
        .map { File(it, SERVER_IN_PROJECT) }.firstOrNull { it.isFile }
}

/** Settings → Node.js 의 인터프리터, 없으면 PATH 의 node (macOS 에서 Dock 으로 띄운 IDE 도 로그인 셸 PATH 를 쓴다) */
private fun node(project: Project): String =
    (NodeJsInterpreterManager.getInstance(project).interpreter as? NodeJsLocalInterpreter)?.interpreterSystemDependentPath
        ?: EnvironmentUtil.getValue("PATH")?.split(File.pathSeparator)?.map { File(it, if (File.separatorChar == '\\') "node.exe" else "node") }?.firstOrNull { it.canExecute() }?.path
        ?: "node"

/**
 * IntelliJ 는 템플릿 문자열 속 HTML 을 주입(injected) HTML 로 다루고, 내장 LSP 클라이언트는 그 안에서 정의 이동·파라미터 정보를 하지 않는다.
 * 그 둘은 여기서 원본(.ts) 위치로 바꿔 서버에 직접 묻는다.
 */
internal class HostPosition(val client: LspClient, val document: TextDocumentIdentifier, val position: Position)

internal fun hostPosition(element: PsiElement, offset: Int, editor: Editor?): HostPosition? {
    val project = element.project
    val manager = InjectedLanguageManager.getInstance(project)
    val file = element.containingFile ?: return null
    if (!manager.isInjectedFragment(file)) return null
    val host = manager.getTopLevelFile(element)?.virtualFile ?: return null
    // 주입된 에디터면 offset 은 조각 기준, 아니면 원본 기준
    val injectedEditor = editor != null && PsiDocumentManager.getInstance(project).getPsiFile(editor.document) == file
    val hostOffset = if (injectedEditor || editor == null) manager.injectedToHost(file, offset) else offset
    val client = LspClientManager.getInstance(project).getClients(SwcLspIntegrationProvider::class.java).firstOrNull() ?: return null
    if (!client.descriptor.isSupportedFile(host)) return null
    val document = FileDocumentManager.getInstance().getDocument(host) ?: return null
    val line = document.getLineNumber(hostOffset)
    return HostPosition(client, client.getDocumentIdentifier(host), Position(line, hostOffset - document.getLineStartOffset(line)))
}

internal fun PsiFile.offsetOf(position: Position): Int? {
    val document = PsiDocumentManager.getInstance(project).getDocument(this) ?: return null
    if (position.line >= document.lineCount) return null
    return (document.getLineStartOffset(position.line) + position.character).coerceAtMost(document.textLength)
}
