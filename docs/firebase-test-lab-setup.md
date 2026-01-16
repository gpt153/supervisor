# Firebase Test Lab - Comprehensive Setup Guide

**Last Updated:** January 16, 2026
**Documentation Status:** Current (Firebase docs updated January 15, 2026)

## Overview

Firebase Test Lab is a cloud-based infrastructure that allows you to test Android and iOS apps on physical and virtual devices hosted in Google data centers. This guide provides step-by-step instructions for automated testing that can be triggered programmatically by a supervisor or CI/CD system.

---

## 1. Initial Setup Requirements

### 1.1 Google Cloud Prerequisites

**Required:**
- Google Cloud account
- Firebase project
- Blaze (pay-as-you-go) pricing plan with linked Cloud Billing account
  - **Note:** Even on Blaze plan, you get free tier limits before charges apply

### 1.2 Firebase Project Setup

**Steps:**
1. Create or select a Firebase project in the Firebase Console
2. Upgrade to Blaze plan (required for Test Lab)
3. Note your Firebase Project ID (needed for API calls)

### 1.3 Required IAM Permissions

**For Service Accounts to Run Tests:**
- `roles/cloudtestservice.testAdmin` (Firebase Test Lab Admin)
- `roles/firebase.analyticsViewer` (Firebase Analytics Viewer)

**Alternative (simpler but broader):**
- `roles/editor` (Editor role) - Required when using default Cloud Storage bucket

**For Service Accounts to Only View Results:**
- `roles/cloudtestservice.testViewer` (Firebase Test Lab Viewer)
- `roles/firebase.analyticsViewer` (Firebase Analytics Viewer)

### 1.4 Create Service Account

**Steps via Google Cloud Console:**
1. Navigate to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `firebase-test-lab-ci` (or similar)
4. Grant role: `Editor` or the specific roles listed above
5. Click "Done"
6. Click the email of the created service account
7. Navigate to "Keys" tab
8. Click "Add Key" > "Create new key"
9. Select JSON format
10. Download the JSON key file (keep secure!)

**Security Note:** Service accounts aren't subject to spam checks or captcha prompts, making them ideal for CI/CD.

### 1.5 Enable Required APIs

Enable these APIs in Google Cloud Console > APIs & Services > Library:
- Cloud Testing API
- Cloud Tool Results API
- Cloud Storage API (usually auto-enabled)

---

## 2. CLI Integration

### 2.1 gcloud CLI Installation (Ubuntu/Linux)

**Method 1: Package Manager (Recommended)**

```bash
# Install prerequisites
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates gnupg curl

# Add Google Cloud repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Install gcloud CLI
sudo apt-get update && sudo apt-get install -y google-cloud-cli
```

**Method 2: Archive File**

```bash
# Download and extract
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh

# Add to PATH
echo 'source /path/to/google-cloud-sdk/path.bash.inc' >> ~/.bashrc
source ~/.bashrc
```

### 2.2 Firebase CLI Tools

Firebase CLI is typically not needed for Test Lab (gcloud handles it), but if needed:

```bash
npm install -g firebase-tools
```

### 2.3 Non-Interactive Authentication (CI/CD)

**Standard Pattern:**

```bash
# Store service account JSON in environment variable
# Example: GCLOUD_SERVICE_KEY contains the JSON content

# Write to file
echo "$GCLOUD_SERVICE_KEY" > ./gcloud-key.json

# Activate service account
gcloud auth activate-service-account --key-file=./gcloud-key.json

# Set project
gcloud --quiet config set project YOUR_FIREBASE_PROJECT_ID

# Verify authentication
gcloud auth list
```

**Alternative using GOOGLE_APPLICATION_CREDENTIALS:**

```bash
# Set environment variable (preferred for Application Default Credentials)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# gcloud will automatically use this for authentication
gcloud config set project YOUR_FIREBASE_PROJECT_ID
```

**Security Best Practices:**
- Store service account JSON in CI/CD secrets (GitHub Secrets, GitLab CI/CD variables, etc.)
- Base64 encode if needed: `cat key.json | base64 -w 0`
- Decode in CI: `echo "$BASE64_KEY" | base64 -d > key.json`
- Delete key file after use in temporary CI environments

---

## 3. Test Execution

### 3.1 Building APKs from Command Line

**Build Debug APK:**

```bash
# Navigate to project root
cd /path/to/android/project

# Build app APK
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

**Build Test APK (Instrumented Tests):**

```bash
# Build instrumented test APK
./gradlew assembleDebugAndroidTest

# Output: app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
```

**Both at once:**

```bash
./gradlew assembleDebug assembleDebugAndroidTest
```

### 3.2 Running Instrumented Tests

**Basic Command:**

```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app/build/outputs/apk/debug/app-debug.apk \
  --test app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
  --device model=Pixel2,version=28,locale=en,orientation=portrait \
  --timeout 15m
```

**Multiple Devices (Test Matrix):**

```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --device model=Pixel2,version=28,locale=en,orientation=portrait \
  --device model=Pixel5,version=30,locale=en,orientation=portrait \
  --device model=Nexus6,version=21,locale=en,orientation=landscape \
  --timeout 15m
```

**With Test Orchestrator (Recommended):**

```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --use-orchestrator \
  --device model=Pixel2,version=28 \
  --timeout 15m
```

**Test Specific Classes or Methods:**

```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --test-targets "class com.example.MyTestClass" \
  --device model=Pixel2,version=28
```

**With Custom Environment Variables:**

```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --environment-variables coverage=true,coverageFile="/sdcard/coverage.ec" \
  --directories-to-pull /sdcard \
  --device model=Pixel2,version=28
```

### 3.3 Running Robo Tests (No Test Code Required)

**Basic Robo Test:**

```bash
gcloud firebase test android run \
  --type robo \
  --app app-debug.apk \
  --device model=Pixel2,version=28,locale=en,orientation=portrait \
  --timeout 5m
```

**When to Use Robo vs Instrumented:**
- **Robo Test:** Quick exploratory testing, crash detection, no test code needed
- **Instrumented Test:** Precise control, specific flows, explicit assertions, complete testing

### 3.4 Using YAML Configuration (Recommended for Complex Setups)

**Create argspec.yml:**

```yaml
# argspec.yml
type: instrumentation
app: app/build/outputs/apk/debug/app-debug.apk
test: app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
timeout: 15m
results-bucket: gs://your-custom-bucket
results-dir: test-results-${BUILD_ID}

device:
  - model: Pixel2
    version: 28
    locale: en
    orientation: portrait
  - model: Pixel5
    version: 30
    locale: en
    orientation: portrait
  - model: Nexus6
    version: 21
    locale: fr
    orientation: landscape

environment-variables:
  - coverage=true
  - coverageFile=/sdcard/coverage.ec

directories-to-pull:
  - /sdcard
```

**Run with YAML:**

```bash
gcloud firebase test android run argspec.yml
```

### 3.5 Getting Test Results

**Result Storage:**
- Default: Stored in Firebase-managed Cloud Storage bucket
- Retention: 90 days (automatic deletion)
- Custom: Use `--results-bucket` to specify your own bucket (retention you control)

**Result Formats:**
- JUnit XML files (located at `<device>/test_result_1.xml`)
- JSON (via ToolResults API)
- Console output with summary
- Screenshots and videos in Cloud Storage

**Exit Codes:**
- `0` - All tests passed
- `1` - Test failure
- Non-zero - Various error conditions (useful for CI/CD scripts)

**Accessing Results Programmatically:**

```bash
# Get test matrix ID from output
TEST_MATRIX_ID="matrix-abc123"

# Use ToolResults API to fetch detailed results
# (Requires Cloud Tool Results API enabled)
```

---

## 4. Cost Management

### 4.1 Free Tier Limits (2026)

**Spark Plan (No-Cost):**
- 15 test runs per day (total across all test types)
- 30 minutes/day on physical devices
- 60 minutes/day on virtual devices

**Blaze Plan (Pay-as-you-go):**
- Same free tier as Spark: 30 min/day physical, 60 min/day virtual
- After free tier: Charges apply per minute

### 4.2 Pricing After Free Tier

**Billing Method:**
- Charged per minute of test execution
- Rounded up to nearest minute (22 seconds = 1 minute, 75 seconds = 2 minutes)
- Only "test running time" is billed (not setup/teardown)

**Estimated Rates:**
- Approximately $15/hour for physical devices
- Lower rates for virtual devices
- Use pricing calculator: https://firebase.google.com/pricing

### 4.3 Monitoring Usage

**Firebase Console:**
- Navigate to Project Settings > Usage and billing
- View Test Lab usage under "Usage" tab

**Google Cloud Console:**
- Navigate to IAM & Admin > Quotas
- Search for "Firebase Test Lab"
- View current usage and limits

### 4.4 Setting Up Budget Alerts

**Basic Budget Alert:**

1. Go to Google Cloud Console > Billing > Budgets & alerts
2. Click "Create Budget"
3. Set budget amount (e.g., $50/month)
4. Configure thresholds:
   - For testing: 1%, 2%, 5%, 50% of Actual
   - For production: 50%, 100% of Actual, 150% of Forecasted
5. Add email recipients
6. Save

**Advanced: Pub/Sub Notifications for Real-Time Alerts**

```bash
# Create Pub/Sub topic
gcloud pubsub topics create firebase-testlab-budget-alerts

# Configure budget to send to topic
# (Done via Cloud Console: Billing > Budgets > Connect Pub/Sub)

# Subscribe and process alerts programmatically
gcloud pubsub subscriptions create budget-alert-sub \
  --topic firebase-testlab-budget-alerts
```

**Important:** Budget alerts do NOT cap usage - they only notify you.

### 4.5 Cost Optimization Strategies

1. **Use Virtual Devices for Development:**
   - Virtual devices are cheaper
   - Use physical devices only for final validation

2. **Shard Large Test Suites:**
   - Break into smaller, parallel runs
   - Reduces wall-clock time
   - Same cost but faster feedback

3. **Optimize Test Timeouts:**
   - Don't use default 15m if tests finish in 2m
   - Set realistic timeouts to avoid paying for hung tests

4. **Run Robo Tests First:**
   - Quick smoke tests with Robo (5 minutes)
   - Full instrumented suite only if Robo passes

5. **Use Custom Results Bucket:**
   - Store results longer than 90 days only if needed
   - Configure lifecycle policies to delete old results

6. **Test on Fewer Devices Initially:**
   - Start with 2-3 representative devices
   - Expand matrix only for release candidates

---

## 5. Device Selection

### 5.1 Viewing Available Devices

**List All Devices:**

```bash
gcloud firebase test android models list
```

**Sample Output:**

```
MODEL_ID      MANUFACTURER  MODEL_NAME           FORM       RESOLUTION    OS_VERSION_IDS
blueline      Google        Pixel 3              PHYSICAL   1080x2160     28,29
panther       Google        Pixel 7              VIRTUAL    1080x2400     33
Pixel2        Google        Pixel 2              VIRTUAL    1080x1920     26,27,28
```

**Get Device Details:**

```bash
gcloud firebase test android models describe Pixel2
```

**Check Device Capacity:**

```bash
gcloud firebase test android list-device-capacities
```

Output shows: High, Medium, Low capacity for each device.

### 5.2 Virtual vs Physical Devices

**Virtual Devices (Emulators):**
- **Pros:** Lower cost, higher capacity, faster startup, good for most testing
- **Cons:** May not catch device-specific bugs, performance differs from real devices
- **Use for:** Development, CI/CD, smoke tests, rapid iteration
- **Timeout:** Up to 60 minutes

**Physical Devices (Real Hardware):**
- **Pros:** Real-world behavior, actual hardware sensors, true performance
- **Cons:** Higher cost, limited capacity, slower startup
- **Use for:** Release validation, device-specific issues, final QA
- **Timeout:** Up to 45 minutes

**Capacity Considerations:**
- Virtual devices auto-scale based on demand
- Physical devices have limited availability (check capacity before scheduling)
- "Reduced Stability" indicator = device having issues for 30+ days

### 5.3 Recommended Device Matrix for Testing

**Minimal Matrix (2-3 devices):**
```bash
# Cover different screen sizes and OS versions
--device model=Nexus5,version=23     # Older device, Android 6.0
--device model=Pixel2,version=28     # Mid-range, Android 9.0
--device model=Pixel5,version=30     # Newer device, Android 11.0
```

**Balanced Matrix (5-7 devices):**
```bash
# Add different manufacturers and form factors
--device model=Nexus5,version=23          # Small screen, older Android
--device model=Pixel2,version=28          # Google, mid-size
--device model=Pixel5,version=30          # Google, newer
--device model=oriole,version=31          # Pixel 6, Android 12
--device model=a10,version=29             # Samsung Galaxy A10
--device model=j7xelte,version=24         # Samsung, different chipset
--device model=hero2lte,version=26        # Samsung Galaxy S7 Edge
```

**Comprehensive Matrix (10+ devices):**
Add tablets, different locales, landscape orientation tests.

**Best Practice:**
- Use virtual devices during development
- Add 1-2 physical devices for critical user flows
- Expand to full matrix only for release candidates

### 5.4 Targeting Specific Android API Levels

**Check Available API Levels:**

```bash
gcloud firebase test android models list | grep "version"
```

**Test Across Multiple API Levels:**

```bash
# Test same device on multiple OS versions
--device model=Pixel2,version=26
--device model=Pixel2,version=27
--device model=Pixel2,version=28
```

**Deprecated Devices:**
- Test Lab removes deprecated devices after 1 month notice
- Virtual versions remain available after physical removal

---

## 6. Integration with CI/CD

### 6.1 GitHub Actions Integration

**Example Workflow (.github/workflows/firebase-test.yml):**

```yaml
name: Firebase Test Lab

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
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

      - name: Build APKs
        run: |
          ./gradlew assembleDebug assembleDebugAndroidTest

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
            --app app/build/outputs/apk/debug/app-debug.apk \
            --test app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
            --device model=Pixel2,version=28 \
            --device model=Pixel5,version=30 \
            --timeout 15m \
            --results-bucket=gs://my-test-results-bucket \
            --results-dir=github-run-${{ github.run_id }}

      - name: Download test results
        if: always()
        run: |
          mkdir -p test-results
          gsutil -m cp -r gs://my-test-results-bucket/github-run-${{ github.run_id }}/* test-results/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: firebase-test-results
          path: test-results/
```

**Required GitHub Secrets:**
- `GOOGLE_CREDENTIALS` - Service account JSON key (paste entire JSON)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

### 6.2 Using Firebase Test Lab GitHub Action

**Alternative using marketplace action:**

```yaml
- name: Run Firebase Test Lab
  uses: asadmansr/Firebase-Test-Lab-Action@v1.0
  with:
    arg-spec: 'argspec.yml'
  env:
    SERVICE_ACCOUNT: ${{ secrets.GOOGLE_CREDENTIALS }}
```

### 6.3 Cloud Build Integration

**cloudbuild.yaml:**

```yaml
steps:
  # Build APKs
  - name: 'gcr.io/cloud-builders/gradle'
    args: ['assembleDebug', 'assembleDebugAndroidTest']

  # Run tests on Firebase Test Lab
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'firebase'
      - 'test'
      - 'android'
      - 'run'
      - '--type=instrumentation'
      - '--app=app/build/outputs/apk/debug/app-debug.apk'
      - '--test=app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk'
      - '--device=model=Pixel2,version=28'
      - '--timeout=15m'
    env:
      - 'CLOUDSDK_CORE_PROJECT=${PROJECT_ID}'

timeout: 1800s  # 30 minutes
```

**Trigger Cloud Build:**

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### 6.4 Supervisor Programmatic Triggering

**Shell Script (supervisor_run_tests.sh):**

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_ID="your-firebase-project-id"
SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"
APP_APK="app/build/outputs/apk/debug/app-debug.apk"
TEST_APK="app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"

# Authenticate
gcloud auth activate-service-account --key-file="$SERVICE_ACCOUNT_KEY"
gcloud config set project "$PROJECT_ID"

# Build APKs
echo "Building APKs..."
./gradlew assembleDebug assembleDebugAndroidTest

# Run tests
echo "Running tests on Firebase Test Lab..."
gcloud firebase test android run \
  --type instrumentation \
  --app "$APP_APK" \
  --test "$TEST_APK" \
  --device model=Pixel2,version=28 \
  --device model=Pixel5,version=30 \
  --timeout 15m \
  --results-bucket=gs://my-results \
  --results-dir="supervisor-run-$(date +%Y%m%d-%H%M%S)" \
  --format=json > test_results.json

# Parse results
TEST_STATE=$(jq -r '.testMatrixId' test_results.json)
echo "Test Matrix ID: $TEST_STATE"

# Exit with appropriate code
if [ $? -eq 0 ]; then
  echo "Tests passed!"
  exit 0
else
  echo "Tests failed!"
  exit 1
fi
```

### 6.5 Webhook/Callback for Test Completion

**Using Cloud Functions (Recommended):**

**functions/index.js:**

```javascript
const functions = require('firebase-functions');
const axios = require('axios');

exports.testLabWebhook = functions.testLab.testMatrix()
  .onComplete(async (testMatrix) => {
    const { testMatrixId, state, outcomeSummary } = testMatrix;

    // Prepare webhook payload
    const payload = {
      testMatrixId,
      state,
      outcomeSummary,
      timestamp: new Date().toISOString()
    };

    // Send to your webhook endpoint
    try {
      await axios.post('https://your-webhook-endpoint.com/test-complete', payload);
      console.log('Webhook sent successfully');
    } catch (error) {
      console.error('Webhook failed:', error);
    }

    return null;
  });
```

**Deploy:**

```bash
firebase deploy --only functions:testLabWebhook
```

**Using Eventarc (Alternative):**

```bash
# Create trigger
gcloud eventarc triggers create firebase-test-lab-trigger \
  --location=us-central1 \
  --destination-run-service=your-cloud-run-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.firebase.testlab.testMatrix.v1.completed"
```

---

## 7. Results and Reporting

### 7.1 Test Results Storage

**Default Storage:**
- Location: Firebase-managed Cloud Storage bucket
- Retention: 90 days (automatic deletion)
- Access: Via Firebase Console or ToolResults API

**Custom Storage Bucket:**

```bash
# Create your own bucket
gsutil mb gs://your-custom-test-results-bucket

# Grant Test Lab service account access
gsutil iam ch serviceAccount:firebase-test-lab@YOUR_PROJECT.iam.gserviceaccount.com:objectAdmin \
  gs://your-custom-test-results-bucket

# Use in tests
gcloud firebase test android run \
  --results-bucket=gs://your-custom-test-results-bucket \
  --results-dir=test-run-${BUILD_ID} \
  ...
```

**Lifecycle Policy for Cost Control:**

```bash
# Create lifecycle.json
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF

# Apply to bucket
gsutil lifecycle set lifecycle.json gs://your-custom-test-results-bucket
```

### 7.2 Downloading Test Results

**Download All Results:**

```bash
# Get results directory from test output
RESULTS_DIR="gs://bucket-name/test-results-dir"

# Download everything
gsutil -m cp -r "$RESULTS_DIR" ./local-test-results/
```

**Download Specific Files:**

```bash
# Download videos only
gsutil -m cp -r "$RESULTS_DIR/**/video.mp4" ./videos/

# Download screenshots
gsutil -m cp -r "$RESULTS_DIR/**/screenshots/" ./screenshots/

# Download JUnit XML
gsutil -m cp -r "$RESULTS_DIR/**/test_result_*.xml" ./junit-results/

# Download logs
gsutil -m cp -r "$RESULTS_DIR/**/logcat" ./logs/
```

### 7.3 Parsing Test Results Programmatically

**JUnit XML Format (Primary):**

Location: `<results-dir>/<device-config>/test_result_1.xml`

**Example Python Parser:**

```python
import xml.etree.ElementTree as ET

def parse_test_results(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    results = {
        'total_tests': int(root.attrib.get('tests', 0)),
        'failures': int(root.attrib.get('failures', 0)),
        'errors': int(root.attrib.get('errors', 0)),
        'skipped': int(root.attrib.get('skipped', 0)),
        'time': float(root.attrib.get('time', 0)),
        'test_cases': []
    }

    for testcase in root.findall('.//testcase'):
        test = {
            'name': testcase.attrib.get('name'),
            'classname': testcase.attrib.get('classname'),
            'time': float(testcase.attrib.get('time', 0)),
            'status': 'passed'
        }

        if testcase.find('failure') is not None:
            test['status'] = 'failed'
            test['message'] = testcase.find('failure').attrib.get('message')
        elif testcase.find('error') is not None:
            test['status'] = 'error'
            test['message'] = testcase.find('error').attrib.get('message')
        elif testcase.find('skipped') is not None:
            test['status'] = 'skipped'

        results['test_cases'].append(test)

    return results

# Usage
results = parse_test_results('test_result_1.xml')
print(f"Passed: {results['total_tests'] - results['failures'] - results['errors']}")
print(f"Failed: {results['failures']}")
print(f"Errors: {results['errors']}")
```

**Convert XML to JSON:**

```bash
# Using Python
python3 -c "
import xml.etree.ElementTree as ET
import json
import sys

tree = ET.parse('test_result_1.xml')
root = tree.getroot()

result = {
    'tests': root.attrib.get('tests'),
    'failures': root.attrib.get('failures'),
    'errors': root.attrib.get('errors')
}

print(json.dumps(result, indent=2))
"
```

### 7.4 Using ToolResults API for Programmatic Access

**Enable API:**

```bash
gcloud services enable toolresults.googleapis.com
```

**API Documentation:**
https://firebase.google.com/docs/test-lab/reference/toolresults/rest

**Example: List Test Executions:**

```bash
# Get history ID from test matrix output
HISTORY_ID="your-history-id"
EXECUTION_ID="your-execution-id"

# Fetch execution details (requires authenticated HTTP client)
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://toolresults.googleapis.com/toolresults/v1beta3/projects/${PROJECT_ID}/histories/${HISTORY_ID}/executions/${EXECUTION_ID}"
```

### 7.5 Integration with Reporting Tools

**Allure Reports:**

```bash
# Generate Allure report from JUnit XML
allure generate --clean -o allure-report junit-results/
allure open allure-report
```

**Jenkins Integration:**

```groovy
// Jenkinsfile
post {
  always {
    junit 'junit-results/**/*.xml'
    publishHTML([
      allowMissing: false,
      alwaysLinkToLastBuild: true,
      keepAll: true,
      reportDir: 'test-results',
      reportFiles: 'index.html',
      reportName: 'Firebase Test Lab Results'
    ])
  }
}
```

---

## 8. Limitations and Gotchas

### 8.1 Test Timeout Limits

**Maximum Test Duration:**
- Physical devices: 45 minutes
- Virtual devices: 60 minutes
- Default: 15 minutes

**Three Important Timeouts:**

1. **Test Timeout (`--timeout`)**: Maximum time for entire test execution
   ```bash
   --timeout 15m  # Set appropriately for your test suite
   ```

2. **Test Orchestrator Timeouts**: Per-test timeouts in your test code
   ```kotlin
   @Test(timeout = 30000)  // 30 seconds per test
   fun myTest() { ... }
   ```

3. **CI/CD Timeout**: Your CI system's job timeout
   ```yaml
   timeout: 30m  # Give buffer beyond test timeout
   ```

**Best Practice:** Set realistic timeouts to avoid wasting credits on hung tests.

### 8.2 APK Size Limits

**Validation Phase:**
- APKs are validated and re-signed before testing
- Large APKs (>100MB) take longer to validate
- No hard size limit documented, but very large APKs may timeout during validation

**Optimization:**
- Use `splits` or `bundletool` for large apps
- Remove unnecessary resources for test builds
- Consider using Test APK sharding for large test suites

### 8.3 Network Connectivity

**Internet Access:**
- Virtual and physical devices have internet access
- You can test network-dependent features

**Restrictions:**
- Some network configurations may differ from real-world usage
- VPN or special network configurations not supported

### 8.4 Device Storage and File Access

**Writable Directories:**
- `/sdcard/` is accessible for reading/writing
- Use `--directories-to-pull` to retrieve files after tests

**Storage Limits:**
- Limited device storage (similar to real devices)
- Clean up large files during tests to avoid issues

### 8.5 Sensors and Hardware

**Physical Devices:**
- All real sensors available (GPS, camera, accelerometer, etc.)

**Virtual Devices:**
- Limited sensor simulation
- Some hardware features not available or behave differently

### 8.6 Common Failure Modes

**"Infrastructure Failure":**
- Test Lab infrastructure issue (not your app)
- Tests not billed for infrastructure failures
- Retry the test

**"Test Timeout":**
- Tests exceeded timeout limit
- Increase timeout or optimize tests
- Check for hung tests or infinite loops

**"Incompatible APK":**
- APK not compatible with selected device
- Check minimum SDK version vs device API level
- Verify APK architecture matches device

**"Device Unavailable":**
- Physical device at capacity
- Try different device or use virtual device
- Check capacity with `list-device-capacities`

### 8.7 Flaky Tests

**Test Lab Features for Flaky Tests:**
- Automatic flakiness detection
- Reports tests that pass/fail inconsistently

**Mitigation:**
- Use Test Orchestrator to isolate tests
- Clear app data between tests
- Avoid shared state
- Add proper waits (not fixed delays)

### 8.8 Screenshot Testing Brittleness

**Device-Specific Rendering:**
- Different devices render slightly differently
- Physical vs virtual differences

**Best Practice:**
- Target Arm (*.arm) emulator devices for screenshot tests
- Use tolerance thresholds in comparisons
- Test on consistent device set

### 8.9 Test Lab Quotas

**Project-Level Quotas:**
- Shared across all test types (instrumentation, Robo, Game Loop)
- Daily quotas reset at midnight Pacific Time
- Quota errors: "QuotaExceeded"

**Mitigation:**
- Monitor daily usage
- Space out test runs
- Request quota increase if needed

### 8.10 Sharding for Long Test Suites

**Why Shard:**
- Test suites longer than 45/60 minutes
- Faster results through parallel execution
- Same cost, better UX

**Manual Sharding Example:**

```bash
# Shard 1
gcloud firebase test android run \
  --test-targets "package com.example.tests.suite1" \
  ...

# Shard 2
gcloud firebase test android run \
  --test-targets "package com.example.tests.suite2" \
  ...
```

**Automatic Sharding (via tools):**
- Use Flank: https://flank.github.io/flank/
- Handles sharding and parallel execution automatically

---

## 9. Best Practices Summary

### 9.1 Development Workflow

1. **Local Testing First:**
   - Use Android Studio emulator or connected device
   - Run tests locally before cloud testing

2. **Robo Tests for Smoke Testing:**
   - Quick 5-minute Robo test before full suite
   - Catches obvious crashes fast

3. **Virtual Devices for CI:**
   - Use virtual devices in CI/CD
   - Faster, cheaper, higher capacity

4. **Physical Devices for Release:**
   - Validate on 1-2 physical devices before release
   - Test device-specific features

### 9.2 Cost Optimization

1. **Optimize Test Timeouts:**
   - Match timeout to actual test duration
   - Add 20% buffer, not 300%

2. **Shard Large Test Suites:**
   - Parallel execution reduces wall-clock time
   - No cost increase, faster feedback

3. **Use Smaller Device Matrix During Development:**
   - 2-3 devices for regular testing
   - Full matrix only for releases

4. **Custom Results Bucket with Lifecycle:**
   - Control retention period
   - Auto-delete old results

### 9.3 Reliability

1. **Use Test Orchestrator:**
   - Isolates tests, prevents shared state issues
   - Reduces flakiness

2. **Proper Waits, Not Sleeps:**
   - Use Espresso idling resources
   - Wait for conditions, not fixed durations

3. **Clear App Data Between Tests:**
   - Test Orchestrator does this automatically
   - Ensures clean state

4. **Monitor for Flaky Tests:**
   - Review Test Lab's flakiness reports
   - Fix or quarantine flaky tests

### 9.4 CI/CD Integration

1. **Store Service Account Key Securely:**
   - Use CI secrets management
   - Never commit keys to repository

2. **Parse Exit Codes:**
   - Handle different failure modes appropriately
   - Retry on infrastructure failures

3. **Upload Results as Artifacts:**
   - Store JUnit XML, screenshots, videos
   - Makes debugging easier

4. **Set Up Notifications:**
   - Cloud Functions webhook for real-time alerts
   - Email notifications for critical failures

---

## 10. Quick Reference Commands

### Authentication
```bash
# Non-interactive auth
gcloud auth activate-service-account --key-file=key.json
gcloud config set project PROJECT_ID
```

### Build APKs
```bash
./gradlew assembleDebug assembleDebugAndroidTest
```

### List Devices
```bash
gcloud firebase test android models list
```

### Run Instrumented Test
```bash
gcloud firebase test android run \
  --type instrumentation \
  --app app-debug.apk \
  --test app-debug-androidTest.apk \
  --device model=Pixel2,version=28 \
  --timeout 15m
```

### Run Robo Test
```bash
gcloud firebase test android run \
  --type robo \
  --app app-debug.apk \
  --device model=Pixel2,version=28 \
  --timeout 5m
```

### Download Results
```bash
gsutil -m cp -r gs://bucket/results-dir ./local-results/
```

### Check Usage
```bash
# Via Firebase Console
# Project Settings > Usage and billing

# Via gcloud
gcloud firebase test android list-device-capacities
```

---

## 11. Troubleshooting

### Tests Not Running

**Check:**
1. Service account has correct permissions
2. APIs are enabled (Cloud Testing API, Tool Results API)
3. APKs are valid (run locally first)
4. Device model/version are available

### Tests Timing Out

**Solutions:**
1. Increase `--timeout` value
2. Shard test suite into smaller runs
3. Check for hung tests or infinite loops
4. Optimize test execution time

### "Permission Denied" Errors

**Solutions:**
1. Verify service account has `roles/editor` or specific Test Lab roles
2. Check project ID is correct
3. Re-authenticate: `gcloud auth login`

### "Device Unavailable"

**Solutions:**
1. Check device capacity: `gcloud firebase test android list-device-capacities`
2. Try different device or virtual alternative
3. Retry later if physical device at capacity

### Results Not Appearing

**Solutions:**
1. Wait a few minutes (processing delay)
2. Check Cloud Storage bucket directly
3. Verify results bucket permissions if using custom bucket

---

## 12. Additional Resources

### Official Documentation
- [Firebase Test Lab](https://firebase.google.com/docs/test-lab)
- [gcloud firebase test android run](https://cloud.google.com/sdk/gcloud/reference/firebase/test/android/run)
- [Cloud Tool Results API](https://firebase.google.com/docs/test-lab/reference/toolresults/rest)
- [IAM Permissions Reference](https://firebase.google.com/docs/test-lab/android/iam-permissions-reference)

### GitHub Actions
- [Firebase Test Lab Action](https://github.com/marketplace/actions/firebase-test-lab-action)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
- [google-github-actions/setup-gcloud](https://github.com/google-github-actions/setup-gcloud)

### Tools
- [Flank](https://flank.github.io/flank/) - Parallel test execution with automatic sharding
- [Test Lab Results Parser](https://github.com/appunite/test-lab-results-parser) - Python parser for results

### Articles
- [UI Testing with GitHub Actions and Firebase Test Lab](https://www.presidio.com/technical-blog/ui-testing-with-github-actions-and-firebase-test-lab-in-android-jetpack-compose/)
- [CI/CD Pipeline Using GitHub Actions](https://dustn.dev/post/2022-02-21-build-a-cicd-pipeline-using-github-actions/)
- [Android Application Testing with Firebase Robo Test](https://medium.com/wantedly-engineering/android-application-testing-with-firebase-robo-test-c674e1754298)

---

## Sources

- [Firebase Test Lab](https://firebase.google.com/docs/test-lab)
- [Get started testing for Android with Firebase Test Lab](https://firebase.google.com/docs/test-lab/android/get-started)
- [Start testing with continuous integration (CI) systems](https://firebase.google.com/docs/test-lab/android/continuous)
- [Start testing with the gcloud CLI](https://firebase.google.com/docs/test-lab/android/command-line)
- [gcloud firebase test android run](https://cloud.google.com/sdk/gcloud/reference/firebase/test/android/run)
- [Usage levels, quotas, and pricing for Test Lab](https://firebase.google.com/docs/test-lab/usage-quotas-pricing)
- [Available devices in Test Lab](https://firebase.google.com/docs/test-lab/android/available-testing-devices)
- [IAM permissions reference guide](https://firebase.google.com/docs/test-lab/android/iam-permissions-reference)
- [Analyze Firebase Test Lab Results](https://firebase.google.com/docs/test-lab/android/analyzing-results)
- [Cloud Tool Results API](https://firebase.google.com/docs/test-lab/reference/toolresults/rest)
- [Firebase Test Lab triggers (Cloud Functions)](https://firebase.google.com/docs/functions/test-lab-events)
- [gcloud auth activate-service-account](https://cloud.google.com/sdk/gcloud/reference/auth/activate-service-account)
- [Quickstart: Install the Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk)
- [Build your app from the command line](https://developer.android.com/build/building-cmdline)
- [Run a Robo test (Android)](https://firebase.google.com/docs/test-lab/android/robo-ux-test)
- [Set up advanced billing alerts and logic](https://firebase.google.com/docs/projects/billing/advanced-billing-alerts-logic)
- [Avoid surprise bills](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills)
- [Testing on Firebase Test Lab - Codemagic Docs](https://docs.codemagic.io/yaml-testing/firebase-test-lab/)
- [GitHub Actions: Firebase Test Lab](https://medium.com/firebase-developers/github-actions-firebase-test-lab-4bc830685a99)
- [UI Testing with GitHub Actions and Firebase Test Lab](https://www.presidio.com/technical-blog/ui-testing-with-github-actions-and-firebase-test-lab-in-android-jetpack-compose/)
- [Integrate Test Lab into your CI/CD system (Codelab)](https://firebase.google.com/codelabs/ci-with-testlab)
