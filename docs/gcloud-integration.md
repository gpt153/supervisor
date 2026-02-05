# GCloud Integration for Meta-Supervisor

**Date:** 2026-01-18
**Requirement:** Meta-supervisor has FULL access to GCloud across multiple accounts
**Purpose:** Manage VMs, networking, storage, services across all GCloud projects

---

## Overview

**What meta-supervisor can do:**
- Start/stop/resize VMs
- Create/delete VMs
- Manage firewall rules
- Monitor VM health (CPU, RAM, disk)
- Manage Cloud Storage buckets
- Deploy Cloud Run services
- Manage networking (VPCs, subnets, load balancers)
- Full billing and quota access

**GCloud Accounts:**
1. **VM Host Account** - Hosts supervisor-service VM and shared infrastructure
2. **OpenHorizon Account** - Hosts openhorizon.cc production services
3. **Future Projects** - Additional accounts as needed

**User workflow:**
```
User: "Check VM health and increase RAM if CPU is high"

Meta-supervisor:
1. Queries GCloud Monitoring API
2. Finds CPU at 85% for 2 hours
3. Stops VM
4. Resizes to n1-standard-2 → n1-standard-4
5. Starts VM
6. Reports: "VM upgraded to 4 vCPUs, 15GB RAM"
```

**All automatic, zero manual GCloud console access.**

---

## GCloud Service Accounts

**What are service accounts:**
- Special Google accounts for applications (not humans)
- Can be granted IAM roles (Owner, Editor, Viewer, custom)
- Authenticate via JSON key file
- Can access any GCloud API

**Owner role permissions (what meta-supervisor gets):**
- ✅ Full read/write access to all resources
- ✅ Can create/delete VMs, storage, services
- ✅ Can modify IAM policies
- ✅ Can view billing and quotas
- ✅ Can manage networking
- ✅ **Everything except deleting the project itself**

---

## Required Service Accounts

**Two service accounts (one per GCloud account):**

### 1. VM Host Account Service Account

**Project:** Your main GCloud project hosting supervisor VM
**Name:** `supervisor-meta@{project-id}.iam.gserviceaccount.com`
**Role:** Owner
**Purpose:** Manage supervisor VM, shared services, billing

**Permissions needed:**
- Compute Engine (VMs, disks, networks)
- Cloud Monitoring (metrics, alerts)
- Cloud Storage (backups, artifacts)
- Cloud Run (deploy services)
- IAM (manage other service accounts)
- Billing (view costs, quotas)

### 2. OpenHorizon Account Service Account

**Project:** openhorizon-prod (or similar)
**Name:** `supervisor-meta@openhorizon-prod.iam.gserviceaccount.com`
**Role:** Owner
**Purpose:** Manage OpenHorizon production infrastructure

**Permissions needed:**
- Same as above (full access to this project)

---

## Creating Service Accounts

### Manual Setup (One-Time)

**For each GCloud project:**

```bash
# 1. Set project
gcloud config set project YOUR_PROJECT_ID

# 2. Create service account
gcloud iam service-accounts create supervisor-meta \
  --display-name="Meta-Supervisor Service Account" \
  --description="Full access for meta-supervisor to manage infrastructure"

# 3. Grant Owner role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:supervisor-meta@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/owner"

# 4. Create JSON key
gcloud iam service-accounts keys create supervisor-meta-key.json \
  --iam-account=supervisor-meta@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 5. Store key in secrets system
cat supervisor-meta-key.json | \
  # Copy content, then store via MCP tool

# 6. Delete local key file (security)
rm supervisor-meta-key.json
```

### Automated Setup (Meta-Supervisor Can Do)

```typescript
// Meta-supervisor can create service accounts in other projects
// if it has admin access to those projects

await gcloudManager.createServiceAccount({
  project: 'openhorizon-prod',
  name: 'supervisor-meta',
  displayName: 'Meta-Supervisor Service Account',
  role: 'roles/owner'
});

const keyJson = await gcloudManager.createServiceAccountKey({
  project: 'openhorizon-prod',
  serviceAccount: 'supervisor-meta@openhorizon-prod.iam.gserviceaccount.com'
});

// Store in secrets
await mcp__meta__set_secret({
  keyPath: 'meta/gcloud/openhorizon_key',
  value: JSON.stringify(keyJson),
  description: 'GCloud service account for OpenHorizon (Owner role)'
});
```

---

## Storing Service Account Keys

**⚠️ CRITICAL: ALL GCloud service account keys MUST be stored in the secrets management system**

**See:** `/home/samuel/supervisor/docs/secrets-management-system.md`

**Never:**
- ❌ Store keys in files
- ❌ Commit keys to Git
- ❌ Store keys in environment variables (not persistent)

**Always:**
- ✅ Use mcp__meta__set_secret to store
- ✅ Use mcp__meta__get_secret to retrieve
- ✅ Keys encrypted at rest (AES-256-GCM)

**Store in secrets system (via mcp__meta__set_secret):**

```typescript
// VM Host account key
await mcp__meta__set_secret({
  keyPath: 'meta/gcloud/vm_host_key',
  value: JSON.stringify({
    "type": "service_account",
    "project_id": "your-vm-host-project",
    "private_key_id": "abc123...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...",
    "client_email": "supervisor-meta@your-project.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
  }),
  description: 'GCloud service account for VM host project (Owner role)'
});

// OpenHorizon account key
await mcp__meta__set_secret({
  keyPath: 'meta/gcloud/openhorizon_key',
  value: JSON.stringify({ /* service account JSON */ }),
  description: 'GCloud service account for OpenHorizon project (Owner role)'
});

// Future projects...
await mcp__meta__set_secret({
  keyPath: 'meta/gcloud/project3_key',
  value: JSON.stringify({ /* service account JSON */ }),
  description: 'GCloud service account for Project 3'
});
```

**Security notes:**
- Keys encrypted at rest (AES-256-GCM via secrets system)
- Only meta-supervisor can access
- Audit trail (access_count, last_accessed_at)
- Can rotate keys via GCloud console

---

## GCloudManager Implementation

```typescript
// supervisor-service/src/gcloud/GCloudManager.ts

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export class GCloudManager {
  private projects: Map<string, {
    projectId: string;
    auth: JWT;
    compute: any;
    monitoring: any;
    storage: any;
    run: any;
  }>;

  constructor() {
    this.projects = new Map();
  }

  /**
   * Add GCloud project (authenticate with service account)
   */
  async addProject(name: string, serviceAccountKey: any): Promise<void> {
    const auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',  // Full access
        'https://www.googleapis.com/auth/compute',
        'https://www.googleapis.com/auth/monitoring',
        'https://www.googleapis.com/auth/devstorage.full_control'
      ]
    });

    // Initialize API clients
    const compute = google.compute({ version: 'v1', auth });
    const monitoring = google.monitoring({ version: 'v3', auth });
    const storage = google.storage({ version: 'v1', auth });
    const run = google.run({ version: 'v1', auth });

    this.projects.set(name, {
      projectId: serviceAccountKey.project_id,
      auth,
      compute,
      monitoring,
      storage,
      run
    });
  }

  /**
   * Get VM instance details
   */
  async getVM(
    project: string,
    zone: string,
    instanceName: string
  ): Promise<{
    name: string;
    status: string;
    machineType: string;
    cpus: number;
    memoryMB: number;
    diskGB: number;
    internalIP: string;
    externalIP: string;
  }> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    const result = await proj.compute.instances.get({
      project: proj.projectId,
      zone,
      instance: instanceName
    });

    const instance = result.data;

    // Parse machine type (e.g., "zones/us-central1-a/machineTypes/n1-standard-1")
    const machineTypeParts = instance.machineType.split('/');
    const machineType = machineTypeParts[machineTypeParts.length - 1];

    // Get machine type details for CPU/RAM
    const machineTypeDetails = await proj.compute.machineTypes.get({
      project: proj.projectId,
      zone,
      machineType
    });

    const internalIP = instance.networkInterfaces?.[0]?.networkIP || '';
    const externalIP = instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP || '';

    return {
      name: instance.name,
      status: instance.status,  // RUNNING, STOPPED, TERMINATED
      machineType,
      cpus: machineTypeDetails.data.guestCpus,
      memoryMB: machineTypeDetails.data.memoryMb,
      diskGB: instance.disks?.[0]?.diskSizeGb || 0,
      internalIP,
      externalIP
    };
  }

  /**
   * Start VM
   */
  async startVM(project: string, zone: string, instanceName: string): Promise<void> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    await proj.compute.instances.start({
      project: proj.projectId,
      zone,
      instance: instanceName
    });

    // Wait for VM to be running
    await this.waitForVMStatus(project, zone, instanceName, 'RUNNING', 120);
  }

  /**
   * Stop VM
   */
  async stopVM(project: string, zone: string, instanceName: string): Promise<void> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    await proj.compute.instances.stop({
      project: proj.projectId,
      zone,
      instance: instanceName
    });

    // Wait for VM to be stopped
    await this.waitForVMStatus(project, zone, instanceName, 'TERMINATED', 120);
  }

  /**
   * Resize VM (change machine type)
   */
  async resizeVM(
    project: string,
    zone: string,
    instanceName: string,
    newMachineType: string  // e.g., 'n1-standard-4'
  ): Promise<void> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    // Must stop VM before resizing
    const vm = await this.getVM(project, zone, instanceName);
    if (vm.status === 'RUNNING') {
      await this.stopVM(project, zone, instanceName);
    }

    // Change machine type
    await proj.compute.instances.setMachineType({
      project: proj.projectId,
      zone,
      instance: instanceName,
      requestBody: {
        machineType: `zones/${zone}/machineTypes/${newMachineType}`
      }
    });

    // Restart VM
    await this.startVM(project, zone, instanceName);
  }

  /**
   * Get VM CPU usage (last N minutes)
   */
  async getVMCPUUsage(
    project: string,
    zone: string,
    instanceName: string,
    minutes: number = 60
  ): Promise<{
    average: number;
    max: number;
    current: number;
  }> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60 * 1000);

    const result = await proj.monitoring.projects.timeSeries.list({
      name: `projects/${proj.projectId}`,
      filter: `metric.type="compute.googleapis.com/instance/cpu/utilization" AND resource.labels.instance_name="${instanceName}"`,
      'interval.startTime': startTime.toISOString(),
      'interval.endTime': endTime.toISOString(),
      'aggregation.alignmentPeriod': '60s',
      'aggregation.perSeriesAligner': 'ALIGN_MEAN'
    });

    const timeSeries = result.data.timeSeries?.[0];
    if (!timeSeries || !timeSeries.points || timeSeries.points.length === 0) {
      return { average: 0, max: 0, current: 0 };
    }

    const values = timeSeries.points.map(p => p.value.doubleValue * 100);  // Convert to percentage

    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      current: values[values.length - 1]
    };
  }

  /**
   * Get VM memory usage
   */
  async getVMMemoryUsage(
    project: string,
    zone: string,
    instanceName: string,
    minutes: number = 60
  ): Promise<{
    average: number;
    max: number;
    current: number;
  }> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60 * 1000);

    const result = await proj.monitoring.projects.timeSeries.list({
      name: `projects/${proj.projectId}`,
      filter: `metric.type="compute.googleapis.com/instance/memory/percent_used" AND resource.labels.instance_name="${instanceName}"`,
      'interval.startTime': startTime.toISOString(),
      'interval.endTime': endTime.toISOString(),
      'aggregation.alignmentPeriod': '60s',
      'aggregation.perSeriesAligner': 'ALIGN_MEAN'
    });

    const timeSeries = result.data.timeSeries?.[0];
    if (!timeSeries || !timeSeries.points || timeSeries.points.length === 0) {
      return { average: 0, max: 0, current: 0 };
    }

    const values = timeSeries.points.map(p => p.value.doubleValue);

    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      current: values[values.length - 1]
    };
  }

  /**
   * Get VM disk usage
   */
  async getVMDiskUsage(
    project: string,
    zone: string,
    instanceName: string
  ): Promise<{
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usedPercent: number;
  }> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    // Get disk usage from monitoring (requires monitoring agent)
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000);  // Last 5 minutes

    const result = await proj.monitoring.projects.timeSeries.list({
      name: `projects/${proj.projectId}`,
      filter: `metric.type="agent.googleapis.com/disk/percent_used" AND resource.labels.instance_id="${instanceName}"`,
      'interval.startTime': startTime.toISOString(),
      'interval.endTime': endTime.toISOString()
    });

    const timeSeries = result.data.timeSeries?.[0];
    if (!timeSeries || !timeSeries.points || timeSeries.points.length === 0) {
      // Fallback: Get disk size from VM config
      const vm = await this.getVM(project, zone, instanceName);
      return {
        totalGB: vm.diskGB,
        usedGB: 0,
        freeGB: vm.diskGB,
        usedPercent: 0
      };
    }

    const usedPercent = timeSeries.points[timeSeries.points.length - 1].value.doubleValue;
    const vm = await this.getVM(project, zone, instanceName);
    const totalGB = vm.diskGB;
    const usedGB = (totalGB * usedPercent) / 100;

    return {
      totalGB,
      usedGB,
      freeGB: totalGB - usedGB,
      usedPercent
    };
  }

  /**
   * Create VM
   */
  async createVM(
    project: string,
    zone: string,
    options: {
      name: string;
      machineType: string;
      diskSizeGB: number;
      imageFamily: string;  // e.g., 'ubuntu-2004-lts'
      imageProject: string;  // e.g., 'ubuntu-os-cloud'
      networkTags?: string[];
      metadata?: Record<string, string>;
    }
  ): Promise<void> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    await proj.compute.instances.insert({
      project: proj.projectId,
      zone,
      requestBody: {
        name: options.name,
        machineType: `zones/${zone}/machineTypes/${options.machineType}`,
        disks: [
          {
            boot: true,
            autoDelete: true,
            initializeParams: {
              sourceImage: `projects/${options.imageProject}/global/images/family/${options.imageFamily}`,
              diskSizeGb: options.diskSizeGB
            }
          }
        ],
        networkInterfaces: [
          {
            network: 'global/networks/default',
            accessConfigs: [
              {
                type: 'ONE_TO_ONE_NAT',
                name: 'External NAT'
              }
            ]
          }
        ],
        tags: {
          items: options.networkTags || []
        },
        metadata: {
          items: Object.entries(options.metadata || {}).map(([key, value]) => ({
            key,
            value
          }))
        }
      }
    });

    // Wait for VM to be created and running
    await this.waitForVMStatus(project, zone, options.name, 'RUNNING', 300);
  }

  /**
   * Delete VM
   */
  async deleteVM(project: string, zone: string, instanceName: string): Promise<void> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    await proj.compute.instances.delete({
      project: proj.projectId,
      zone,
      instance: instanceName
    });
  }

  /**
   * List all VMs in project
   */
  async listVMs(project: string, zone?: string): Promise<Array<{
    name: string;
    zone: string;
    status: string;
    machineType: string;
  }>> {
    const proj = this.projects.get(project);
    if (!proj) {
      throw new Error(`Project ${project} not configured`);
    }

    if (zone) {
      // List VMs in specific zone
      const result = await proj.compute.instances.list({
        project: proj.projectId,
        zone
      });

      return (result.data.items || []).map(instance => ({
        name: instance.name,
        zone,
        status: instance.status,
        machineType: instance.machineType.split('/').pop()
      }));
    } else {
      // List VMs across all zones
      const result = await proj.compute.instances.aggregatedList({
        project: proj.projectId
      });

      const vms: any[] = [];
      for (const [zoneUrl, zoneInstances] of Object.entries(result.data.items || {})) {
        if (!zoneInstances.instances) continue;

        const zoneName = zoneUrl.split('/').pop();
        for (const instance of zoneInstances.instances) {
          vms.push({
            name: instance.name,
            zone: zoneName,
            status: instance.status,
            machineType: instance.machineType.split('/').pop()
          });
        }
      }

      return vms;
    }
  }

  /**
   * Wait for VM to reach specific status
   */
  private async waitForVMStatus(
    project: string,
    zone: string,
    instanceName: string,
    targetStatus: string,
    timeoutSeconds: number
  ): Promise<void> {
    const startTime = Date.now();

    while (true) {
      const vm = await this.getVM(project, zone, instanceName);
      if (vm.status === targetStatus) {
        return;
      }

      if ((Date.now() - startTime) / 1000 > timeoutSeconds) {
        throw new Error(
          `Timeout waiting for VM ${instanceName} to reach status ${targetStatus} ` +
          `(current: ${vm.status})`
        );
      }

      await new Promise(resolve => setTimeout(resolve, 5000));  // Check every 5 seconds
    }
  }
}
```

---

## MCP Tools for Meta-Supervisor

```typescript
// MCP tool definitions

{
  name: 'mcp__meta__gcloud_get_vm',
  description: 'Get VM instance details',
  parameters: {
    project: { type: 'string' },      // 'vm-host' or 'openhorizon'
    zone: { type: 'string' },          // e.g., 'us-central1-a'
    instanceName: { type: 'string' }
  }
}

{
  name: 'mcp__meta__gcloud_start_vm',
  description: 'Start a stopped VM',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    instanceName: { type: 'string' }
  }
}

{
  name: 'mcp__meta__gcloud_stop_vm',
  description: 'Stop a running VM',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    instanceName: { type: 'string' }
  }
}

{
  name: 'mcp__meta__gcloud_resize_vm',
  description: 'Resize VM (change machine type)',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    instanceName: { type: 'string' },
    newMachineType: { type: 'string' }  // e.g., 'n1-standard-4'
  }
}

{
  name: 'mcp__meta__gcloud_vm_health',
  description: 'Get VM CPU, memory, disk usage',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    instanceName: { type: 'string' },
    minutes: { type: 'number', optional: true }  // Default: 60
  }
}

{
  name: 'mcp__meta__gcloud_list_vms',
  description: 'List all VMs in project',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__gcloud_create_vm',
  description: 'Create new VM instance',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    name: { type: 'string' },
    machineType: { type: 'string' },
    diskSizeGB: { type: 'number' }
  }
}

{
  name: 'mcp__meta__gcloud_delete_vm',
  description: 'Delete VM instance',
  parameters: {
    project: { type: 'string' },
    zone: { type: 'string' },
    instanceName: { type: 'string' }
  }
}
```

---

## Usage Patterns

### Pattern 1: Check VM Health

```typescript
// User: "Check if the VM is healthy"

const health = await mcp__meta__gcloud_vm_health({
  project: 'vm-host',
  zone: 'us-central1-a',
  instanceName: 'supervisor-vm',
  minutes: 60
});

// Returns:
{
  cpu: {
    average: 45.2,
    max: 78.5,
    current: 42.1
  },
  memory: {
    average: 62.8,
    max: 81.2,
    current: 65.4
  },
  disk: {
    totalGB: 50,
    usedGB: 32.5,
    freeGB: 17.5,
    usedPercent: 65.0
  }
}

// Meta-supervisor reports:
// "VM Health (last 60 min):
// - CPU: 42% current, 45% avg, 79% peak
// - Memory: 65% current, 63% avg, 81% peak
// - Disk: 33GB used / 50GB total (65%)"
```

### Pattern 2: Auto-Scale VM Based on Load

```typescript
// User: "Increase VM size if CPU is high"

// Or automatic (meta-supervisor monitors every hour):

const health = await mcp__meta__gcloud_vm_health({
  project: 'vm-host',
  zone: 'us-central1-a',
  instanceName: 'supervisor-vm',
  minutes: 120
});

if (health.cpu.average > 70 && health.cpu.max > 85) {
  // High CPU for 2 hours, scale up

  const currentVM = await mcp__meta__gcloud_get_vm({
    project: 'vm-host',
    zone: 'us-central1-a',
    instanceName: 'supervisor-vm'
  });

  // Current: n1-standard-2 (2 vCPUs, 7.5GB RAM)
  // Upgrade to: n1-standard-4 (4 vCPUs, 15GB RAM)

  await mcp__meta__gcloud_resize_vm({
    project: 'vm-host',
    zone: 'us-central1-a',
    instanceName: 'supervisor-vm',
    newMachineType: 'n1-standard-4'
  });

  // Meta-supervisor reports:
  // "⚠️ CPU usage high (avg 78%, peak 92% over last 2 hours)
  // ✅ Upgraded VM: n1-standard-2 → n1-standard-4
  // ✅ Now: 4 vCPUs, 15GB RAM
  // ✅ VM restarted, services back online"
}
```

### Pattern 3: Deploy New Project VM

```typescript
// User: "Create new VM for Project X"

await mcp__meta__gcloud_create_vm({
  project: 'vm-host',
  zone: 'us-central1-a',
  name: 'project-x-vm',
  machineType: 'n1-standard-1',
  diskSizeGB: 30
});

// VM created, now install software
// (via SSH or startup script)

// Meta-supervisor reports:
// "✅ Created project-x-vm:
// - Type: n1-standard-1 (1 vCPU, 3.75GB RAM)
// - Disk: 30GB SSD
// - Zone: us-central1-a
// - External IP: 34.91.182.200
// - Status: RUNNING"
```

### Pattern 4: List All VMs Across Projects

```typescript
// User: "Show all my VMs"

const vmHostVMs = await mcp__meta__gcloud_list_vms({
  project: 'vm-host'
});

const openhorizonVMs = await mcp__meta__gcloud_list_vms({
  project: 'openhorizon'
});

// Meta-supervisor reports:
// "You have 3 VMs across 2 projects:
//
// VM Host Project:
// - supervisor-vm (us-central1-a): RUNNING, n1-standard-2
// - test-vm (us-central1-a): STOPPED, n1-standard-1
//
// OpenHorizon Project:
// - openhorizon-prod (europe-west1-b): RUNNING, n1-standard-4"
```

### Pattern 5: Automatic VM Monitoring (Cron Job)

```typescript
// Meta-supervisor runs every hour

async function monitorVMs() {
  const projects = ['vm-host', 'openhorizon'];

  for (const project of projects) {
    const vms = await mcp__meta__gcloud_list_vms({ project });

    for (const vm of vms) {
      const health = await mcp__meta__gcloud_vm_health({
        project,
        zone: vm.zone,
        instanceName: vm.name,
        minutes: 60
      });

      // Alert if CPU > 80% for 1 hour
      if (health.cpu.average > 80) {
        console.log(`⚠️ High CPU on ${vm.name}: ${health.cpu.average}%`);
        // Optionally: auto-scale or notify user
      }

      // Alert if disk > 85%
      if (health.disk.usedPercent > 85) {
        console.log(`⚠️ Disk almost full on ${vm.name}: ${health.disk.usedPercent}%`);
        // Optionally: clean up or increase disk size
      }

      // Alert if memory > 90%
      if (health.memory.average > 90) {
        console.log(`⚠️ High memory on ${vm.name}: ${health.memory.average}%`);
        // Optionally: restart services or increase RAM
      }
    }
  }
}

// Run every hour via cron
setInterval(monitorVMs, 60 * 60 * 1000);
```

---

## Integration with Project Supervisors

**Project supervisors can request VM operations via meta-supervisor:**

```typescript
// Project supervisor (consilio) wants to deploy service

// 1. Check if current VM can handle additional service
const health = await mcp__meta__gcloud_vm_health({
  project: 'vm-host',
  zone: 'us-central1-a',
  instanceName: 'supervisor-vm',
  minutes: 30
});

if (health.cpu.average > 60 || health.memory.average > 70) {
  // VM already loaded, create dedicated VM for this project
  await mcp__meta__gcloud_create_vm({
    project: 'vm-host',
    zone: 'us-central1-a',
    name: 'consilio-vm',
    machineType: 'n1-standard-2',
    diskSizeGB: 30
  });

  // Deploy on new VM
} else {
  // VM has capacity, deploy on existing
  await deployService({ /* ... */ });
}
```

---

## Cost Monitoring

**Track GCloud costs:**

```typescript
// Get billing data (requires Billing Account Admin role)

import { cloudbilling } from '@googleapis/cloudbilling';

const billing = cloudbilling({ version: 'v1', auth });

// Get current month costs
const startDate = new Date();
startDate.setDate(1);  // First day of month

const result = await billing.billingAccounts.projects.list({
  name: `billingAccounts/${billingAccountId}`
});

// Process billing data
const monthlyCost = result.data.projectBillingInfo
  .reduce((sum, project) => sum + project.billingEnabled ? estimateCost(project) : 0, 0);

console.log(`Current month GCloud costs: $${monthlyCost.toFixed(2)}`);
```

---

## Security Best Practices

**What we're doing right:**
- ✅ Service accounts (not personal account keys)
- ✅ Owner role (full access for automation)
- ✅ Keys encrypted at rest (secrets system)
- ✅ Keys not in Git
- ✅ Audit trail (secrets access tracking)

**Additional hardening (optional):**
- Rotate service account keys quarterly
- Use Workload Identity (if running on GKE)
- Enable audit logging (track all GCloud API calls)
- Set up billing alerts (prevent runaway costs)
- Use VPC Service Controls (restrict API access by network)

---

## Initial Setup Checklist

**Phase 1: Create Service Accounts**
- [ ] Create supervisor-meta service account in VM host project
- [ ] Grant Owner role
- [ ] Create JSON key
- [ ] Store key in secrets system
- [ ] Delete local key file
- [ ] Repeat for OpenHorizon project
- [ ] Repeat for any additional projects

**Phase 2: GCloudManager Implementation**
- [ ] Implement GCloudManager.ts
- [ ] Add addProject() method
- [ ] Add VM methods (get, start, stop, resize, create, delete, list)
- [ ] Add monitoring methods (CPU, memory, disk)
- [ ] Write unit tests

**Phase 3: MCP Tools**
- [ ] Expose all gcloud_* MCP tools
- [ ] Add permission checks (only meta-supervisor)
- [ ] Test each tool

**Phase 4: Load Service Account Keys**
- [ ] Retrieve keys from secrets
- [ ] Initialize GCloudManager for each project
- [ ] Verify authentication works

**Phase 5: Monitoring Setup**
- [ ] Implement hourly VM health check
- [ ] Set up alerts (high CPU, disk, memory)
- [ ] Optional: Auto-scaling logic
- [ ] Optional: Cost monitoring

**Phase 6: Documentation**
- [ ] Update meta-supervisor CLAUDE.md with GCloud usage
- [ ] Document VM naming conventions
- [ ] Document when to create new VMs vs use existing
- [ ] Add to troubleshooting guide

---

## Summary

**What we built:**
- GCloudManager for full VM and resource management
- Support for multiple GCloud accounts/projects
- VM health monitoring (CPU, memory, disk)
- Automatic VM scaling based on load
- MCP tools for meta-supervisor
- Zero manual GCloud console access needed

**What meta-supervisor can do:**
- Monitor VM health across all projects
- Auto-scale VMs when needed
- Create/delete VMs for new projects
- Start/stop VMs to save costs
- Track resource usage and billing

**Result:**
- User: "Check VM health and scale if needed"
- Meta-supervisor:
  1. Queries GCloud Monitoring
  2. Finds high CPU usage
  3. Resizes VM automatically
  4. Reports: "VM upgraded, services restarted"
- All automatic, no manual GCloud console access

**Estimated implementation time:** 8-10 hours

**This completes requirement #6 - the final piece!**

---

## All Requirements Complete! 🎉

You asked for 6 things, all now documented:
1. ✅ PIV loop adaptation (don't copy Cole verbatim)
2. ✅ Instruction propagation (update all supervisors with one command)
3. ✅ Secrets management (simple, predictable)
4. ✅ Port allocation (guaranteed no conflicts)
5. ✅ Cloudflare integration (automatic DNS and tunnel management)
6. ✅ GCloud integration (full VM access across all accounts)

**Ready to implement!**
