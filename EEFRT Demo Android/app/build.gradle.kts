plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.serialization)
}

// Task to run npm build in the public directory
tasks.register("buildWebAssets") {
    group = "build"
    description = "Build web assets using npm"
    
    doLast {
        val publicDir = File(project.rootDir.parentFile, "public")
        if (!publicDir.exists()) {
            throw GradleException("Public directory not found at: ${publicDir.absolutePath}")
        }
        
        val packageJson = File(publicDir, "package.json")
        if (!packageJson.exists()) {
            throw GradleException("package.json not found in public directory")
        }
        
        println("Running npm run build in ${publicDir.absolutePath}")
        
        // Try to find npm in common locations
        val npmPaths = listOf(
            "/opt/homebrew/bin/npm",
            "/usr/local/bin/npm"
        )
        
        val npmPath = npmPaths.find { File(it).exists() }
        if (npmPath == null) {
            throw GradleException("npm not found. Please ensure Node.js is installed.")
        }
        
        println("Using npm at: $npmPath")
        
        val processBuilder = ProcessBuilder()
        processBuilder.directory(publicDir)
        
        // Set up environment variables for NVM
        val env = processBuilder.environment()
        env["PATH"] = "${File(npmPath).parent}:${env["PATH"] ?: ""}"
        env["NVM_DIR"] = System.getProperty("user.home") + "/.nvm"

        processBuilder.command(npmPath, "install")

        processBuilder.command(npmPath, "run", "build")
        
        val process = processBuilder.start()
        val exitCode = process.waitFor()
        
        if (exitCode != 0) {
            val errorOutput = process.errorStream.bufferedReader().readText()
            throw GradleException("npm build failed with exit code $exitCode: $errorOutput")
        }
        
        println("npm build completed successfully")
    }
}

android {
    namespace = "ai.a2i2.conductor.effrtdemoandroid"
    compileSdk = 35

    defaultConfig {
        applicationId = "au.org.blackdoginstitute.effrtdemo"
        minSdk = 28
        targetSdk = 35
        versionCode = 3
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

// Configure tasks to run web build before Android build
afterEvaluate {
    tasks.matching { task ->
        task.name.contains("assemble") || task.name.contains("bundle")
    }.configureEach {
        dependsOn("buildWebAssets")
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.webkit)
    implementation(libs.kotinx.serialization.json)
    implementation(libs.androidx.room.common)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.gson)
    implementation(libs.krate)
    implementation(libs.krate.kotlinx)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}