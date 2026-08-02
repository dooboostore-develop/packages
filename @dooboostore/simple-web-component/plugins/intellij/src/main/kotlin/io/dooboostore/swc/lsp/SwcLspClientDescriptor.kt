package io.dooboostore.swc.lsp

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.ProjectWideLspClientDescriptor
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.platform.lsp.api.customization.LspCompletionCustomizer
import com.intellij.platform.lsp.api.customization.LspCustomization
import com.intellij.platform.lsp.api.customization.LspSemanticTokensCustomizer
import java.nio.file.Path

/**
 * Owns the SWC language server and declares which files it supports.
 *
 * The compiled server bundle lives at:
 *   lsp/out/server/server.js   (relative to the monorepo root)
 *
 * The absolute path is supplied at launch via the `swc.lsp.server` system property.
 * Fallback resolution walks up from `user.dir` to find the checked-out monorepo.
 */
class SwcLspClientDescriptor(project: Project) : ProjectWideLspClientDescriptor(project, "Simple Web Component") {

    private val customization = SwcCustomization()

    override val lspCustomization: LspCustomization
        get() = customization

    override fun isSupportedFile(file: VirtualFile): Boolean = isCandidateFile(file)

    override fun createCommandLine(): GeneralCommandLine {
        val serverJs = System.getProperty("swc.lsp.server")
            ?: locateServerInRepository()
        val node = System.getenv("SWC_LSP_NODE") ?: "node"
        return GeneralCommandLine(node, serverJs, "--stdio")
            .withRedirectErrorStream(true)
    }

    /** Fallback: derive from the repository checkout when the property is unset. */
    private fun locateServerInRepository(): String {
        val cwd = Path.of(System.getProperty("user.dir"))
        val repoRoot = generateSequence(cwd) { it.parent }
            .firstOrNull { it.resolve("lsp/src/server/server.ts").toFile().isFile }
            ?: error("Cannot locate SWC LSP server.js. Pass -Dswc.lsp.server=/abs/path to server.js")
        return repoRoot.resolve("lsp/out/server/server.js").toAbsolutePath().toString()
    }

    companion object {
        val CANDIDATE_EXTENSIONS = setOf("ts", "mts", "cts", "tsx")

        fun isCandidateFile(file: VirtualFile): Boolean =
            file.extension in CANDIDATE_EXTENSIONS
    }
}

/**
 * Wires our SWC completion + semantic-token behaviour into the LSP client.
 */
private class SwcCustomization : LspCustomization() {
    override val completionCustomizer: LspCompletionCustomizer = SwcCompletionCustomizer()
    override val semanticTokensCustomizer: LspSemanticTokensCustomizer = SwcSemanticTokensCustomizer()
}