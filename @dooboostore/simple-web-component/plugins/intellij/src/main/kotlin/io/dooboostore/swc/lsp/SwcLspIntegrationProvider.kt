package io.dooboostore.swc.lsp

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspIntegrationProvider

/**
 * Registers the Simple Web Component LSP server for supported files.
 *
 * Uses the official IntelliJ LSP integration (new API since 2026.1.4).
 * Spins up a client whenever a candidate file is opened; the descriptor then
 * decides which files the server actually claims.
 */
class SwcLspIntegrationProvider : LspIntegrationProvider {

    override fun fileOpened(
        project: Project,
        file: VirtualFile,
        clientStarter: LspIntegrationProvider.LspClientStarter
    ) {
        if (SwcLspClientDescriptor.isCandidateFile(file)) {
            clientStarter.ensureClientStarted(SwcLspClientDescriptor(project))
        }
    }
}