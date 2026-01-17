# Mobile App Development with Supervisor - Complete Setup Guide

**Date:** January 16, 2026
**Purpose:** Enable all project supervisors to build, test, and deploy iOS and Android apps
**Your Hardware:** Linux VM (E2-standard-8) + MacBook Intel 2019

---

## Executive Summary

**You can build and deploy mobile apps using your existing hardware + Firebase Test Lab!**

### The Solution

- **Android:** Build on Linux VM, test on Firebase Test Lab (serverless, pay-per-use)
- **iOS:** Build on your MacBook, test on Firebase Test Lab (serverless, pay-per-use)
- **Cross-Platform:** Use React Native or Flutter to share 70-90% of code
- **Supervisor Integration:** All project supervisors can trigger builds and tests

### Cost Breakdown

**Minimal Setup (Start Here):**
- Apple Developer Program: $99/year
- Google Play Console: $25 one-time
- Firebase Test Lab: FREE (60 min/day Android + iOS)
- **Total: $124 first year, $99/year after**

**Production Setup (When Scaling):**
- Add AWS Device Farm: $250/month ($3,000/year) for unlimited testing on both platforms
- **Total: ~$3,124/year**

---

## Architecture Overview

### Your Complete Setup

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPERVISOR WORKSPACE                     │
│              /home/samuel/supervisor/[project]/              │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   BMAD     │  │   Epics    │  │    ADRs    │           │
│  │  Planning  │  │  Artifacts │  │  Documents │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Push to GitHub
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                          │
│                                                              │
│  ┌──────────────────┐           ┌──────────────────┐       │
│  │  Linux Runner    │           │  macOS Runner    │       │
│  │  (Android Build) │           │  (iOS Build)     │       │
│  │                  │           │                  │       │
│  │  ./gradlew       │           │  fastlane build  │       │
│  │  assembleDebug   │           │  xcodebuild      │       │
│  │                  │           │                  │       │
│  │  → app-debug.apk │           │  → YourApp.ipa   │       │
│  └──────────────────┘           └──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE TEST LAB                          │
│                     (Serverless Testing)                     │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Android Devices        iOS Devices          │          │
│  │  ─────────────────      ────────────         │          │
│  │  • Pixel 2 (API 28)     • iPhone 12          │          │
│  │  • Pixel 5 (API 30)     • iPhone 14          │          │
│  │  • Samsung A10          • iPad Pro           │          │
│  │                                               │          │
│  │  Tests run in parallel, pay only for runtime │          │
│  │  FREE: 60 min/day per platform               │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    RESULTS & DEPLOYMENT                      │
│                                                              │
│  Supervisor receives:                                        │
│  ✅ All tests passed (47 Android, 42 iOS)                   │
│  📹 Video recordings of test runs                           │
│  📸 Screenshots of UI states                                │
│  📊 JUnit XML results                                       │
│                                                              │
│  If tests pass → fastlane deploys:                          │
│  • Android → Google Play Store (Internal Testing)           │
│  • iOS → TestFlight (Beta Testing)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform-Specific Details

### Android Development

**Where:** Linux VM (your E2-standard-8 instance)

**Build Process:**
1. Gradle builds APK files (app + test APK)
2. Upload to Firebase Test Lab
3. Tests run on virtual/physical Android devices
4. Results return to supervisor

**Why This Works:**
- No emulator needed on your VM
- No hardware acceleration required
- Firebase Test Lab has the devices
- Pay only for test execution time

**Technologies:**
- Build System: Gradle
- Testing Framework: Espresso (UI), JUnit (unit)
- Deployment: fastlane + Google Play Console

### iOS Development

**Where:** MacBook Intel 2019

**Build Process:**
1. Xcode builds IPA file
2. Upload to Firebase Test Lab
3. Tests run on iOS devices in Google's cloud
4. Results return to supervisor

**Why This Works:**
- Your MacBook handles builds (macOS required)
- No iOS simulators needed for CI/CD
- Firebase Test Lab has real iPhones/iPads
- Pay only for test execution time

**Technologies:**
- Build System: Xcode + xcodebuild
- Testing Framework: XCUITest (UI), XCTest (unit)
- Deployment: fastlane + TestFlight

---

## Recommended Tech Stack

### Option 1: Cross-Platform (RECOMMENDED)

**Framework:** React Native or Flutter

**Advantages:**
- Write code once, deploy to iOS + Android
- 70-90% code sharing
- Single test suite for most features
- Faster development
- Can develop on Linux VM or MacBook

**Project Structure:**
```
/home/samuel/supervisor/your-mobile-app/
├── .bmad/                      # Planning artifacts
├── src/                        # Shared code (70-90%)
├── android/                    # Android-specific (5-15%)
├── ios/                        # iOS-specific (5-15%)
├── __tests__/                  # Shared tests
├── fastlane/                   # Build automation
│   ├── Fastfile
│   └── Appfile
├── .github/workflows/
│   ├── android-ci.yml
│   └── ios-ci.yml
├── CLAUDE.md                   # Project supervisor instructions
└── README.md
```

**Recommended Choice:**
- **React Native** if you/team know JavaScript
- **Flutter** if learning new (better performance for graphics)

### Option 2: Native Apps

**Separate codebases for iOS and Android**

**When to use:**
- Need maximum performance
- Heavy platform-specific features
- Team has native expertise
- Different apps for each platform

**Project Structure:**
```
/home/samuel/supervisor/
├── your-android-app/           # Android project
│   ├── .bmad/
│   ├── app/
│   └── CLAUDE.md
└── your-ios-app/               # iOS project (separate)
    ├── .bmad/
    ├── YourApp/
    └── CLAUDE.md
```

---

## Step-by-Step Setup

### Phase 1: Prerequisites (One-Time Setup)

#### A. Google Cloud / Firebase Setup

**1. Create Firebase Project:**
```bash
# On Linux VM
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
source ~/.bashrc

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Create Firebase project (or use existing)
# Go to console.firebase.google.com
# Create new project
# Upgrade to Blaze plan (includes free tier)
```

**2. Enable Required APIs:**
```bash
gcloud services enable cloudtestservice.googleapis.com
gcloud services enable toolresults.googleapis.com
gcloud services enable firebasehosting.googleapis.com
```

**3. Create Service Account for CI/CD:**
```bash
# Create service account
gcloud iam service-accounts create firebase-ci-cd \
    --display-name="Firebase CI/CD Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:firebase-ci-cd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/editor"

# Create and download key
gcloud iam service-accounts keys create firebase-key.json \
    --iam-account=firebase-ci-cd@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Save this key securely - you'll add it to GitHub Secrets
cat firebase-key.json | base64 -w 0
# Copy the output
```

#### B. MacBook Setup (For iOS)

**1. Install Xcode:**
```bash
# On MacBook:
# 1. Open App Store
# 2. Search "Xcode"
# 3. Install (large download, ~10-15GB)
# 4. Open Xcode once to install Command Line Tools
```

**2. Join Apple Developer Program:**
- Go to https://developer.apple.com/programs/
- Enroll ($99/year)
- Wait 24-48 hours for approval

**3. Install fastlane:**
```bash
# On MacBook
sudo gem install fastlane -NV

# Verify installation
fastlane --version
```

**4. Install gcloud CLI:**
```bash
# On MacBook (similar to Linux)
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-x86_64.tar.gz
tar -xf google-cloud-cli-darwin-x86_64.tar.gz
./google-cloud-sdk/install.sh
source ~/.bash_profile

# Authenticate with same project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### C. GitHub Repository Setup

**1. Create GitHub Repo:**
```bash
# On Linux VM (or wherever you're working)
cd /home/samuel/supervisor/your-mobile-app
git init
git remote add origin https://github.com/YOUR_USERNAME/your-mobile-app.git
```

**2. Add GitHub Secrets:**

Go to GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `GOOGLE_CREDENTIALS`: The base64-encoded service account JSON
- `APPLE_ID`: Your Apple ID email (for iOS)
- `APPLE_APP_SPECIFIC_PASSWORD`: Generate at appleid.apple.com

---

### Phase 2: Project Creation

#### Option A: React Native Project

**On Linux VM or MacBook:**
```bash
cd /home/samuel/supervisor
npx react-native init YourMobileApp
cd YourMobileApp

# Initialize Git
git init
git add .
git commit -m "Initial React Native project"

# Create BMAD structure
mkdir -p .bmad/epics
mkdir -p .bmad/adrs
mkdir -p planning-artifacts

# Add CLAUDE.md
touch CLAUDE.md
```

#### Option B: Flutter Project

**On Linux VM or MacBook:**
```bash
# Install Flutter SDK first
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Create project
cd /home/samuel/supervisor
flutter create your_mobile_app
cd your_mobile_app

# Create BMAD structure
mkdir -p .bmad/epics
mkdir -p .bmad/adrs
mkdir -p planning-artifacts

# Add CLAUDE.md
touch CLAUDE.md
```

---

### Phase 3: CI/CD Configuration

#### A. Android GitHub Actions Workflow

**Create `.github/workflows/android-ci.yml`:**

```yaml
name: Android CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
        working-directory: android

      - name: Build APKs
        run: |
          ./gradlew assembleDebug
          ./gradlew assembleDebugAndroidTest
        working-directory: android

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GOOGLE_CREDENTIALS }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.FIREBASE_PROJECT_ID }}

      - name: Run tests on Firebase Test Lab
        run: |
          gcloud firebase test android run \
            --type instrumentation \
            --app android/app/build/outputs/apk/debug/app-debug.apk \
            --test android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
            --device model=Pixel2,version=28,locale=en,orientation=portrait \
            --device model=Pixel5,version=30,locale=en,orientation=portrait \
            --timeout 15m \
            --results-bucket=gs://your-test-results-bucket \
            --results-dir=android-${{ github.run_id }}

      - name: Download test results
        if: always()
        run: |
          mkdir -p test-results
          gsutil -m cp -r gs://your-test-results-bucket/android-${{ github.run_id }}/* test-results/ || true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: android-test-results
          path: test-results/
```

#### B. iOS GitHub Actions Workflow

**Create `.github/workflows/ios-ci.yml`:**

```yaml
name: iOS CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: macos-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable

      - name: Install dependencies
        run: |
          gem install fastlane
          cd ios && pod install && cd ..

      - name: Build iOS app
        run: |
          fastlane ios build_for_testing
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GOOGLE_CREDENTIALS }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.FIREBASE_PROJECT_ID }}

      - name: Run tests on Firebase Test Lab
        run: |
          gcloud firebase test ios run \
            --test ios/build/YourApp.zip \
            --device model=iphone14,version=17.0,locale=en,orientation=portrait \
            --timeout 15m \
            --results-bucket=gs://your-test-results-bucket \
            --results-dir=ios-${{ github.run_id }}

      - name: Download test results
        if: always()
        run: |
          mkdir -p test-results
          gsutil -m cp -r gs://your-test-results-bucket/ios-${{ github.run_id }}/* test-results/ || true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: ios-test-results
          path: test-results/
```

#### C. fastlane Configuration

**Create `fastlane/Fastfile`:**

```ruby
default_platform(:ios)

platform :ios do
  desc "Build for testing"
  lane :build_for_testing do
    build_app(
      scheme: "YourApp",
      configuration: "Debug",
      export_method: "development",
      output_directory: "./build",
      build_path: "./build"
    )
  end

  desc "Deploy to TestFlight"
  lane :beta do
    increment_build_number
    build_app(
      scheme: "YourApp",
      configuration: "Release",
      export_method: "app-store"
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end
end

platform :android do
  desc "Deploy to Play Store Internal Testing"
  lane :beta do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store(
      track: 'internal',
      aab: 'app/build/outputs/bundle/release/app-release.aab'
    )
  end
end
```

---

### Phase 4: Supervisor Integration

#### A. Update Project CLAUDE.md

**Template for mobile projects:**

```markdown
# [Project Name] - Mobile App Supervisor

**Project Type:** Mobile Application (iOS + Android)
**Framework:** [React Native / Flutter / Native]
**Deployment:** Firebase Test Lab + TestFlight + Play Store

## Build and Test Commands

### Android
```bash
# Build APKs
cd android && ./gradlew assembleDebug assembleDebugAndroidTest

# Run tests on Firebase Test Lab
gcloud firebase test android run \
  --type instrumentation \
  --app app/build/outputs/apk/debug/app-debug.apk \
  --test app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
  --device model=Pixel2,version=28
```

### iOS
```bash
# Build app
cd ios && fastlane build_for_testing

# Run tests on Firebase Test Lab
gcloud firebase test ios run \
  --test build/YourApp.zip \
  --device model=iphone14,version=17.0
```

## Verification Workflow

1. SCAR implements feature in .archon workspace
2. Push to GitHub triggers CI/CD
3. Tests run automatically on Firebase Test Lab
4. Supervisor reviews results:
   - Check test pass/fail status
   - Review screenshots/videos
   - Verify functionality
5. If tests pass → deploy to beta testers
6. Collect feedback, iterate

## Common Operations

### Check Test Results
```bash
# Download latest test results
gsutil ls gs://your-test-results-bucket/
gsutil -m cp -r gs://your-test-results-bucket/latest-run/ ./results/
```

### Deploy to Beta
```bash
# iOS
fastlane ios beta

# Android
fastlane android beta
```
```

#### B. Supervisor Commands

**Add to `.claude/commands/mobile-test.md` (if you want a command):**

```markdown
# Mobile App Testing Command

When user says "/test-mobile" or "/run-mobile-tests":

1. Verify current project is mobile app
2. Check if APK/IPA files exist or need building
3. Trigger Firebase Test Lab tests
4. Wait for results
5. Report to user:
   - Total tests run
   - Pass/fail count
   - Links to screenshots/videos
   - Any failures with details
```

---

## Supervisor Workflow Integration

### How Supervisor Uses This Setup

**1. Planning Phase:**
```
User: "I want to build a mobile app for tracking workouts"

Supervisor:
- Creates project using /new-project workout-tracker
- Sets up mobile app structure
- Creates initial epics
- Configures CI/CD
```

**2. Implementation Phase:**
```
Supervisor spawns SCAR:
- SCAR writes React Native code
- SCAR writes tests (Espresso for Android, XCUITest for iOS)
- SCAR pushes to GitHub

GitHub Actions automatically:
- Builds Android APK
- Builds iOS IPA
- Runs tests on Firebase Test Lab
- Reports results
```

**3. Verification Phase:**
```
Supervisor reviews results:
- Reads JUnit XML: parse_test_results(xml_path)
- Downloads screenshots: gsutil cp ...
- Checks video recordings if tests failed
- Reports to user: "✅ All 47 tests passed on 4 devices"
```

**4. Deployment Phase:**
```
If tests pass:
- Supervisor triggers: fastlane ios beta
- Supervisor triggers: fastlane android beta
- TestFlight link sent to user
- Play Store internal testing available
```

---

## Cost Management

### Free Tier Limits

**Firebase Test Lab:**
- 30 test runs/day across both platforms
- 30 min/day on physical devices
- 60 min/day on virtual devices
- Resets daily at midnight Pacific Time

**GitHub Actions:**
- 2,000 minutes/month (free tier)
- macOS runners consume 10x (200 effective macOS minutes)
- Linux runners: full 2,000 minutes

### Usage Estimation

**Typical test run:**
- Android build: 5 minutes (Linux runner)
- iOS build: 8 minutes (macOS runner)
- Android tests: 10 minutes (Firebase Test Lab)
- iOS tests: 10 minutes (Firebase Test Lab)

**Daily development (10 commits):**
- Android: 50 Linux minutes + 100 Firebase minutes
- iOS: 80 macOS minutes + 100 Firebase minutes
- **Free tier covers:** ~20 Android tests/day, ~2 iOS tests/day on GitHub free plan

**Recommendation:**
- Use free tier for initial development
- Add Bitrise/Codemagic ($50-100/month) when hitting GitHub limits
- Add AWS Device Farm ($250/month) when need comprehensive testing

### Budget Alerts

**Set up Firebase budget alerts:**
```bash
# Create budget
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="Firebase Test Lab Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=100
```

---

## Troubleshooting

### Common Issues

**1. "Permission Denied" on Firebase Test Lab**
```bash
# Solution: Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  | grep firebase-ci-cd

# Should see roles/editor or roles/cloudtestservice.testAdmin
```

**2. Android Build Fails on GitHub Actions**
```bash
# Common causes:
# - Missing gradlew execute permission
# - Wrong Java version
# - Missing dependencies

# Add to workflow:
chmod +x gradlew
./gradlew clean
./gradlew dependencies
```

**3. iOS Build Fails - Code Signing**
```bash
# Use fastlane match or Xcode automatic signing
# Add to fastlane/Matchfile:
git_url("https://github.com/YOUR_USERNAME/certificates")
storage_mode("git")
type("development")
```

**4. Tests Time Out**
```bash
# Increase timeout:
--timeout 30m

# Or shard tests:
--test-targets "class com.example.Suite1"
--test-targets "class com.example.Suite2"
```

**5. Firebase Test Lab Quota Exceeded**
```bash
# Check daily usage:
# Firebase Console → Project Settings → Usage

# Solutions:
# - Wait until midnight PT for reset
# - Space out test runs
# - Use virtual devices (more quota)
```

---

## Next Steps

### This Week

1. **Complete Prerequisites:**
   - [ ] Set up Firebase project
   - [ ] Enable APIs
   - [ ] Create service account
   - [ ] Join Apple Developer Program (if doing iOS)
   - [ ] Install Xcode on MacBook (if doing iOS)

2. **Create First Mobile Project:**
   - [ ] Choose framework (React Native vs Flutter vs Native)
   - [ ] Initialize project
   - [ ] Add BMAD structure
   - [ ] Create CLAUDE.md

3. **Test Builds Locally:**
   - [ ] Build Android APK
   - [ ] Build iOS IPA (if doing iOS)
   - [ ] Run on simulator/emulator

### This Month

1. **Set Up CI/CD:**
   - [ ] Create GitHub workflows
   - [ ] Add GitHub secrets
   - [ ] Test automated builds
   - [ ] Verify Firebase Test Lab integration

2. **Write Tests:**
   - [ ] Basic unit tests
   - [ ] UI tests (Espresso/XCUITest)
   - [ ] Run tests locally
   - [ ] Run tests on Firebase Test Lab

3. **Configure Deployment:**
   - [ ] Set up fastlane
   - [ ] Upload to TestFlight (iOS)
   - [ ] Upload to Play Store Internal Testing (Android)

### Next 3 Months

1. **Integrate with Supervisor:**
   - [ ] Create mobile-specific commands
   - [ ] Update supervisor CLAUDE.md
   - [ ] Test full BMAD workflow with mobile app
   - [ ] Document learnings in supervisor-learnings/

2. **Optimize:**
   - [ ] Monitor costs
   - [ ] Optimize test suite speed
   - [ ] Add more device coverage
   - [ ] Set up crash reporting

---

## Key Takeaways

### ✅ What Works Great

1. **Firebase Test Lab** - Perfect serverless solution for testing
2. **GitHub Actions** - Free tier covers initial development
3. **Your existing hardware** - No need to upgrade
4. **Cross-platform frameworks** - Share 70-90% of code
5. **fastlane** - Industry standard automation

### ⚠️ Important Limitations

1. **macOS required for iOS** - Cannot escape this (but you have MacBook)
2. **Free tier limits** - Good for development, may need paid tier at scale
3. **GitHub macOS runners expensive** - Consider self-hosted or Bitrise
4. **Code signing complexity** - iOS requires certificates/provisioning
5. **Test Lab quota resets daily** - Can't carry over unused minutes

### 💡 Pro Tips

1. **Start cross-platform** - Much faster development
2. **Use free tiers first** - Validate idea before paying
3. **Virtual devices for dev** - Physical devices for release
4. **Monitor costs early** - Set budget alerts day one
5. **Self-hosted runner** - Turn MacBook into free iOS builder

---

## Summary

You now have everything needed to build mobile apps with supervisor:

1. ✅ **Android builds** on your Linux VM
2. ✅ **iOS builds** on your MacBook
3. ✅ **Serverless testing** via Firebase Test Lab
4. ✅ **Automated CI/CD** via GitHub Actions
5. ✅ **Cost-effective** - Free tier covers development

**Start with:** React Native or Flutter project, GitHub Actions, Firebase Test Lab free tier

**Scale to:** AWS Device Farm + paid CI/CD when you have users

---

## Additional Resources

- **Firebase Test Lab Setup:** `/home/samuel/supervisor/docs/firebase-test-lab-setup.md`
- **iOS Development Research:** `/home/samuel/supervisor/docs/ios-development-testing-research.md`
- **Android VM Setup:** `/home/samuel/supervisor/docs/android-dev-linux-vm-setup.md` (if created)
- **Supervisor Learnings:** `/home/samuel/supervisor/docs/supervisor-learnings/`

---

**Ready to build mobile apps!** 🚀
