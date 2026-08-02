package io.dooboostore.swc.lsp

import java.nio.file.Files
import java.nio.file.Path

/**
 * Resolves the compiled LSP server + highlight.js output directory.
 *
 * Prefers the `swc.lsp.server` system property (set by runIde). Otherwise walks up from
 * `user.dir` to find the monorepo checkout and derives `lsp/out/server`.
 */
object SwcServerPath {

    private const val SERVER_FILE = "server.js"

    fun resolveServerJs(): Path? {
        val dir = resolveOutputDir() ?: return null
        val js = dir.resolve(SERVER_FILE)
        return if (Files.isRegularFile(js)) js else null
    }

    fun resolveHighlightJs(): Path? {
        val dir = resolveOutputDir() ?: return null
        val js = dir.resolve("highlight.js")
        return if (Files.isRegularFile(js)) js else null
    }

    private var cachedOut: Path? = null

    private fun resolveOutputDir(): Path? {
        cachedOut?.let { return it }
        val prop = System.getProperty("swc.lsp.server")?.takeIf { it.isNotBlank() }
        val out = if (prop != null) {
            Path.of(prop).parent
        } else {
            val cwd = Path.of(System.getProperty("user.dir"))
            val root = generateSequence(cwd) { it.parent }
                .firstOrNull { it.resolve("lsp/src/server/server.ts").toFile().isFile }
                ?: return null
            root.resolve("lsp/out/server").toAbsolutePath()
        }
        cachedOut = out
        return out
    }
}