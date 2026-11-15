// ./gradlew buildPlugin → build/distributions/simple-web-component-intellij-<version>.zip (JetBrains Marketplace 에 올리는 파일)
// ./gradlew runIde      → 이 플러그인이 깔린 IntelliJ 를 띄운다
plugins {
    id("org.jetbrains.intellij.platform") version "2.20.1"
    kotlin("jvm") version "2.4.10"
}

group = "io.dooboostore"
version = "0.1.0"

repositories {
    mavenCentral()
    intellijPlatform { defaultRepositories() }
}

dependencies {
    intellijPlatform {
        // 설치된 IDE 로 빌드 (없으면 intellijIdea("2026.3") 로 내려받는다)
        val local = file("/Applications/IntelliJ IDEA.app")
        if (local.exists()) local(local.path) else intellijIdea("2026.3")
        bundledPlugin("JavaScript")
        pluginVerifier()
    }
}

kotlin { jvmToolchain(21) }

intellijPlatform {
    pluginConfiguration {
        ideaVersion { sinceBuild = "261" }
    }
    pluginVerification {
        ides { local(file("/Applications/IntelliJ IDEA.app")) }
    }
}
