plugins {
    id("java")
    id("org.graalvm.buildtools.native") version "0.10.4"
}

group = "tech.radhi"
version = "1.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(24)
    }
}

graalvmNative {
    binaries {
        named("main") {
            mainClass.set("tech.radhi.Main")
            buildArgs.add("--libc=musl")
            buildArgs.add("--static")
            buildArgs.add("-O3")
        }
    }
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}