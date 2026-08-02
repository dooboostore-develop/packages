import java.io.File

plugins {
    id("org.jetbrains.intellij.platform") version "2.18.1"
    kotlin("jvm") version "2.4.10"
}

group = "io.dooboostore.swc"
version = "0.0.1"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdea("2026.2")
        pluginVerifier()
    }
    implementation(kotlin("stdlib"))
}

intellijPlatform {
    instrumentCode = true
    pluginConfiguration {
        ideaVersion {
            sinceBuild.set("262")
        }
    }
    tasks {
        runIde {
            // Point the SWC LSP server at this monorepo's compiled server bundle.
            val serverJs = project.file("../../lsp/out/server/server.js")
            if (serverJs.isFile) {
                jvmArgs("-Dswc.lsp.server=${serverJs.absolutePath}")
            }
        }
        prepareSandbox {
            // Not distributing node; the server resolves from the checkout.
        }
    }
}

kotlin {
    jvmToolchain(25)
}

tasks {
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        }
    }
}