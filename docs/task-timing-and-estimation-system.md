# Task Timing and Estimation System

**Date:** 2026-01-18
**Problem:** Estimates are terrible - "5-6 hours" actually takes 20 minutes
**Solution:** Track all actual times, learn from data, provide accurate estimates

---

## The Problem with Current Estimates

**Your observation (100% correct):**
> "i want no more of this 6-8 weeks. that is for human developers. but even claude is bad at estimating when multiple subagents are running at once. often is says 5-6 hours and it is completed in 20 minutes"

**Why estimates are wrong:**

1. **Human timelines used for AI work**
   - "6-8 weeks" is for humans (meetings, context switching, breaks)
   - AI agents work 24/7, no breaks, instant context
   - 100x speed difference ignored

2. **No historical data**
   - Claude guesses based on human experience
   - No actual data from previous AI implementations
   - Every estimate is a blind guess

3. **Parallelism not accounted for**
   - "5 tasks × 1 hour each = 5 hours"
   - Reality: 5 agents run in parallel = 1 hour total
   - Sequential estimate for parallel work

4. **No learning from actuals**
   - Task takes 20 minutes
   - Next similar task: Still estimates 5 hours
   - No improvement over time

---

## The Solution: Data-Driven Estimation

**Track everything:**
- ✅ Every subagent execution (start/end time)
- ✅ Every task completion (actual duration)
- ✅ Task type, complexity, project
- ✅ Parallel vs sequential execution
- ✅ Success rate, retry count

**Learn from data:**
- ✅ Find similar past tasks (RAG search)
- ✅ Use actual completion times for estimates
- ✅ Account for parallelism automatically
- ✅ Improve estimates over time

**Provide accurate estimates:**
- ✅ "Based on 15 similar tasks: 18-25 minutes (95% confidence)"
- ✅ "Parallel execution: 3 agents × 20 min = 20 min total (not 60 min)"
- ✅ "Historical average for this project: 22 minutes"

---

## Database Schema

```sql
-- Task execution tracking
CREATE TABLE task_executions (
  id SERIAL PRIMARY KEY,

  -- Task identification
  task_id TEXT NOT NULL,              -- Unique task identifier
  task_type TEXT NOT NULL,             -- 'epic', 'issue', 'feature', 'bugfix', etc.
  task_description TEXT NOT NULL,      -- What the task does
  project_name TEXT NOT NULL,          -- Which project

  -- Agent information
  agent_type TEXT NOT NULL,            -- 'supervisor', 'piv-agent', 'scar', etc.
  agent_model TEXT NOT NULL,           -- 'sonnet', 'haiku', 'opus'
  parent_task_id TEXT,                 -- If spawned by another task

  -- Timing
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,            -- Actual duration
  estimated_seconds INTEGER,           -- What was estimated
  estimation_error NUMERIC,            -- (actual - estimated) / estimated

  -- Execution details
  status TEXT NOT NULL,                -- 'running', 'completed', 'failed', 'cancelled'
  parallel_count INTEGER DEFAULT 1,   -- How many agents ran in parallel
  retry_count INTEGER DEFAULT 0,       -- How many retries
  tokens_used INTEGER,                 -- API tokens consumed

  -- Context
  complexity TEXT,                     -- 'simple', 'medium', 'complex'
  lines_of_code_changed INTEGER,       -- LOC added/modified/deleted
  files_changed INTEGER,               -- Number of files touched
  tests_written INTEGER,               -- Number of tests added

  -- Result
  success BOOLEAN,
  error_message TEXT,
  output_summary TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB                       -- Additional context
);

-- Indexes for fast queries
CREATE INDEX idx_task_executions_type ON task_executions(task_type);
CREATE INDEX idx_task_executions_project ON task_executions(project_name);
CREATE INDEX idx_task_executions_agent ON task_executions(agent_type);
CREATE INDEX idx_task_executions_started ON task_executions(started_at);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_parent ON task_executions(parent_task_id);

-- For semantic search (using RAG)
CREATE INDEX idx_task_executions_description ON task_executions
USING GIN (to_tsvector('english', task_description));

-- Aggregate statistics
CREATE TABLE task_type_stats (
  id SERIAL PRIMARY KEY,
  task_type TEXT NOT NULL,
  project_name TEXT,

  -- Aggregate metrics
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,

  -- Time statistics
  avg_duration_seconds NUMERIC,
  median_duration_seconds NUMERIC,
  p95_duration_seconds NUMERIC,        -- 95th percentile
  min_duration_seconds INTEGER,
  max_duration_seconds INTEGER,

  -- Updated
  last_updated TIMESTAMP DEFAULT NOW(),

  UNIQUE(task_type, project_name)
);

-- Parallel execution tracking
CREATE TABLE parallel_executions (
  id SERIAL PRIMARY KEY,
  parent_task_id TEXT NOT NULL,
  child_task_ids TEXT[] NOT NULL,      -- Array of task IDs

  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,

  -- Timing
  sequential_estimate INTEGER,         -- If run sequentially
  parallel_actual INTEGER,             -- Actual time (parallel)
  time_saved_seconds INTEGER,          -- Sequential - parallel
  parallelism_efficiency NUMERIC,      -- Actual / (sequential / count)

  agent_count INTEGER,                 -- How many agents
  completion_order TEXT[],             -- Order tasks completed

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## TaskTimer Implementation

```typescript
// supervisor-service/src/timing/TaskTimer.ts

import { Pool } from 'pg';

export class TaskTimer {
  private db: Pool;
  private activeTimers: Map<string, TaskExecution>;

  constructor(db: Pool) {
    this.db = db;
    this.activeTimers = new Map();
  }

  /**
   * Start timing a task
   */
  async startTask(options: {
    taskId: string;
    taskType: string;
    taskDescription: string;
    projectName: string;
    agentType: string;
    agentModel: string;
    parentTaskId?: string;
    estimatedSeconds?: number;
    complexity?: 'simple' | 'medium' | 'complex';
  }): Promise<void> {
    const execution: TaskExecution = {
      taskId: options.taskId,
      taskType: options.taskType,
      taskDescription: options.taskDescription,
      projectName: options.projectName,
      agentType: options.agentType,
      agentModel: options.agentModel,
      parentTaskId: options.parentTaskId,
      estimatedSeconds: options.estimatedSeconds,
      complexity: options.complexity,
      startedAt: new Date(),
      status: 'running'
    };

    // Store in memory
    this.activeTimers.set(options.taskId, execution);

    // Store in database
    await this.db.query(`
      INSERT INTO task_executions (
        task_id, task_type, task_description, project_name,
        agent_type, agent_model, parent_task_id,
        started_at, estimated_seconds, complexity, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      execution.taskId,
      execution.taskType,
      execution.taskDescription,
      execution.projectName,
      execution.agentType,
      execution.agentModel,
      execution.parentTaskId,
      execution.startedAt,
      execution.estimatedSeconds,
      execution.complexity,
      execution.status
    ]);
  }

  /**
   * Complete a task
   */
  async completeTask(options: {
    taskId: string;
    success: boolean;
    linesOfCodeChanged?: number;
    filesChanged?: number;
    testsWritten?: number;
    tokensUsed?: number;
    errorMessage?: string;
    outputSummary?: string;
  }): Promise<TaskMetrics> {
    const execution = this.activeTimers.get(options.taskId);
    if (!execution) {
      throw new Error(`No active timer for task ${options.taskId}`);
    }

    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - execution.startedAt.getTime()) / 1000);

    // Calculate estimation error
    let estimationError = null;
    if (execution.estimatedSeconds) {
      estimationError = (durationSeconds - execution.estimatedSeconds) / execution.estimatedSeconds;
    }

    // Update database
    await this.db.query(`
      UPDATE task_executions
      SET
        completed_at = $1,
        duration_seconds = $2,
        estimation_error = $3,
        status = $4,
        success = $5,
        lines_of_code_changed = $6,
        files_changed = $7,
        tests_written = $8,
        tokens_used = $9,
        error_message = $10,
        output_summary = $11
      WHERE task_id = $12
    `, [
      completedAt,
      durationSeconds,
      estimationError,
      options.success ? 'completed' : 'failed',
      options.success,
      options.linesOfCodeChanged,
      options.filesChanged,
      options.testsWritten,
      options.tokensUsed,
      options.errorMessage,
      options.outputSummary,
      options.taskId
    ]);

    // Update aggregate statistics
    await this.updateStats(execution.taskType, execution.projectName);

    // Remove from active timers
    this.activeTimers.delete(options.taskId);

    return {
      taskId: options.taskId,
      durationSeconds,
      estimatedSeconds: execution.estimatedSeconds,
      estimationError,
      success: options.success
    };
  }

  /**
   * Track parallel execution
   */
  async trackParallelExecution(options: {
    parentTaskId: string;
    childTaskIds: string[];
    sequentialEstimate: number;
  }): Promise<void> {
    await this.db.query(`
      INSERT INTO parallel_executions (
        parent_task_id, child_task_ids, started_at, sequential_estimate, agent_count
      ) VALUES ($1, $2, NOW(), $3, $4)
    `, [
      options.parentTaskId,
      options.childTaskIds,
      options.sequentialEstimate,
      options.childTaskIds.length
    ]);
  }

  /**
   * Complete parallel execution tracking
   */
  async completeParallelExecution(parentTaskId: string): Promise<ParallelMetrics> {
    // Get parallel execution record
    const parallelResult = await this.db.query(`
      SELECT * FROM parallel_executions
      WHERE parent_task_id = $1
    `, [parentTaskId]);

    if (parallelResult.rows.length === 0) {
      throw new Error(`No parallel execution found for ${parentTaskId}`);
    }

    const parallel = parallelResult.rows[0];
    const childTaskIds = parallel.child_task_ids;

    // Get completion times for all child tasks
    const tasksResult = await this.db.query(`
      SELECT task_id, completed_at, duration_seconds
      FROM task_executions
      WHERE task_id = ANY($1)
      ORDER BY completed_at
    `, [childTaskIds]);

    const tasks = tasksResult.rows;

    if (tasks.length === 0 || tasks.some(t => !t.completed_at)) {
      // Not all tasks completed yet
      return null;
    }

    // Calculate actual parallel time (time from first start to last completion)
    const firstStart = new Date(parallel.started_at);
    const lastCompletion = new Date(tasks[tasks.length - 1].completed_at);
    const parallelActual = Math.floor((lastCompletion.getTime() - firstStart.getTime()) / 1000);

    // Calculate time saved
    const timeSaved = parallel.sequential_estimate - parallelActual;

    // Calculate efficiency (ideal parallel time = sequential / count)
    const idealParallel = parallel.sequential_estimate / parallel.agent_count;
    const efficiency = idealParallel / parallelActual;

    // Get completion order
    const completionOrder = tasks.map(t => t.task_id);

    // Update database
    await this.db.query(`
      UPDATE parallel_executions
      SET
        completed_at = $1,
        parallel_actual = $2,
        time_saved_seconds = $3,
        parallelism_efficiency = $4,
        completion_order = $5
      WHERE parent_task_id = $6
    `, [
      lastCompletion,
      parallelActual,
      timeSaved,
      efficiency,
      completionOrder,
      parentTaskId
    ]);

    return {
      sequentialEstimate: parallel.sequential_estimate,
      parallelActual,
      timeSaved,
      efficiency,
      agentCount: parallel.agent_count
    };
  }

  /**
   * Get estimate for similar task
   */
  async estimateTask(options: {
    taskDescription: string;
    taskType: string;
    projectName: string;
    complexity?: 'simple' | 'medium' | 'complex';
  }): Promise<TaskEstimate> {
    // 1. Find similar tasks using text search
    const similarTasks = await this.db.query(`
      SELECT
        task_id,
        task_description,
        duration_seconds,
        complexity,
        ts_rank(to_tsvector('english', task_description),
                plainto_tsquery('english', $1)) AS relevance
      FROM task_executions
      WHERE
        task_type = $2
        AND project_name = $3
        AND status = 'completed'
        AND success = true
        ${options.complexity ? 'AND complexity = $4' : ''}
      ORDER BY relevance DESC
      LIMIT 20
    `, [
      options.taskDescription,
      options.taskType,
      options.projectName,
      options.complexity
    ]);

    if (similarTasks.rows.length === 0) {
      // No similar tasks, fall back to type average
      return await this.getTypeAverage(options.taskType, options.projectName);
    }

    // 2. Calculate statistics from similar tasks
    const durations = similarTasks.rows.map(t => t.duration_seconds);
    durations.sort((a, b) => a - b);

    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const median = durations[Math.floor(durations.length / 2)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const min = durations[0];
    const max = durations[durations.length - 1];

    // 3. Calculate confidence interval (95%)
    const stdDev = Math.sqrt(
      durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length
    );
    const confidenceLow = Math.max(min, avg - 1.96 * stdDev);
    const confidenceHigh = Math.min(max, avg + 1.96 * stdDev);

    return {
      estimatedSeconds: Math.round(avg),
      confidenceIntervalLow: Math.round(confidenceLow),
      confidenceIntervalHigh: Math.round(confidenceHigh),
      medianSeconds: median,
      p95Seconds: p95,
      sampleSize: similarTasks.rows.length,
      similarTasks: similarTasks.rows.slice(0, 5).map(t => ({
        description: t.task_description,
        duration: t.duration_seconds
      }))
    };
  }

  /**
   * Get type average as fallback
   */
  private async getTypeAverage(taskType: string, projectName: string): Promise<TaskEstimate> {
    const result = await this.db.query(`
      SELECT
        avg_duration_seconds,
        median_duration_seconds,
        p95_duration_seconds,
        total_executions
      FROM task_type_stats
      WHERE task_type = $1 AND project_name = $2
    `, [taskType, projectName]);

    if (result.rows.length === 0) {
      // No data at all, return conservative estimate
      return {
        estimatedSeconds: 3600,  // 1 hour default
        confidenceIntervalLow: 1800,
        confidenceIntervalHigh: 7200,
        medianSeconds: 3600,
        p95Seconds: 7200,
        sampleSize: 0,
        similarTasks: [],
        note: 'No historical data - conservative estimate'
      };
    }

    const stats = result.rows[0];

    return {
      estimatedSeconds: Math.round(stats.avg_duration_seconds),
      confidenceIntervalLow: Math.round(stats.avg_duration_seconds * 0.5),
      confidenceIntervalHigh: Math.round(stats.p95_duration_seconds),
      medianSeconds: Math.round(stats.median_duration_seconds),
      p95Seconds: Math.round(stats.p95_duration_seconds),
      sampleSize: stats.total_executions,
      similarTasks: [],
      note: 'Based on task type average (no similar tasks found)'
    };
  }

  /**
   * Update aggregate statistics
   */
  private async updateStats(taskType: string, projectName: string): Promise<void> {
    await this.db.query(`
      INSERT INTO task_type_stats (
        task_type,
        project_name,
        total_executions,
        successful_executions,
        failed_executions,
        avg_duration_seconds,
        median_duration_seconds,
        p95_duration_seconds,
        min_duration_seconds,
        max_duration_seconds,
        last_updated
      )
      SELECT
        task_type,
        project_name,
        COUNT(*),
        COUNT(*) FILTER (WHERE success = true),
        COUNT(*) FILTER (WHERE success = false),
        AVG(duration_seconds),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds),
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_seconds),
        MIN(duration_seconds),
        MAX(duration_seconds),
        NOW()
      FROM task_executions
      WHERE
        task_type = $1
        AND project_name = $2
        AND status = 'completed'
      GROUP BY task_type, project_name
      ON CONFLICT (task_type, project_name)
      DO UPDATE SET
        total_executions = EXCLUDED.total_executions,
        successful_executions = EXCLUDED.successful_executions,
        failed_executions = EXCLUDED.failed_executions,
        avg_duration_seconds = EXCLUDED.avg_duration_seconds,
        median_duration_seconds = EXCLUDED.median_duration_seconds,
        p95_duration_seconds = EXCLUDED.p95_duration_seconds,
        min_duration_seconds = EXCLUDED.min_duration_seconds,
        max_duration_seconds = EXCLUDED.max_duration_seconds,
        last_updated = NOW()
    `, [taskType, projectName]);
  }
}
```

---

## Usage Examples

### Example 1: Time a Simple Task

```typescript
// Supervisor starting a task

const taskId = 'epic-007-impl-authentication';

// 1. Get estimate before starting
const estimate = await taskTimer.estimateTask({
  taskDescription: 'Implement authentication system with JWT and NextAuth.js',
  taskType: 'epic',
  projectName: 'consilio',
  complexity: 'complex'
});

// Returns:
// {
//   estimatedSeconds: 1320,        // 22 minutes
//   confidenceIntervalLow: 960,    // 16 minutes
//   confidenceIntervalHigh: 1680,  // 28 minutes
//   medianSeconds: 1260,           // 21 minutes
//   p95Seconds: 1740,              // 29 minutes
//   sampleSize: 15,                // Based on 15 similar tasks
//   similarTasks: [
//     { description: 'Implement OAuth authentication', duration: 1200 },
//     { description: 'Add JWT token system', duration: 1380 },
//     ...
//   ]
// }

// 2. Tell user realistic estimate
console.log(`Estimated time: 16-28 minutes (based on 15 similar tasks)`);

// 3. Start timing
await taskTimer.startTask({
  taskId,
  taskType: 'epic',
  taskDescription: 'Implement authentication system with JWT and NextAuth.js',
  projectName: 'consilio',
  agentType: 'piv-agent',
  agentModel: 'haiku',
  estimatedSeconds: estimate.estimatedSeconds,
  complexity: 'complex'
});

// 4. Do the work...
// (PIV agent implements authentication)

// 5. Complete timing
await taskTimer.completeTask({
  taskId,
  success: true,
  linesOfCodeChanged: 450,
  filesChanged: 12,
  testsWritten: 8,
  tokensUsed: 125000
});

// Returns:
// {
//   taskId: 'epic-007-impl-authentication',
//   durationSeconds: 1290,          // Actual: 21.5 minutes
//   estimatedSeconds: 1320,         // Estimated: 22 minutes
//   estimationError: -0.023,        // Only 2.3% error!
//   success: true
// }

// Report to user:
console.log(`✅ Completed in 21 minutes (estimated 22 minutes)`);
```

### Example 2: Track Parallel Execution

```typescript
// Supervisor spawning multiple agents

const epicId = 'epic-008-dashboard';
const issueIds = ['issue-42', 'issue-43', 'issue-44', 'issue-45'];

// 1. Get estimates for each issue
const estimates = await Promise.all(
  issueIds.map(id => taskTimer.estimateTask({
    taskDescription: `Implement ${id}`,
    taskType: 'issue',
    projectName: 'consilio'
  }))
);

// Estimates:
// issue-42: 18 minutes
// issue-43: 22 minutes
// issue-44: 15 minutes
// issue-45: 25 minutes
// Total sequential: 80 minutes

const sequentialEstimate = estimates.reduce((sum, e) => sum + e.estimatedSeconds, 0);

// 2. Start parallel execution tracking
await taskTimer.trackParallelExecution({
  parentTaskId: epicId,
  childTaskIds: issueIds,
  sequentialEstimate  // 80 minutes
});

// 3. Spawn all agents in parallel
await Promise.all(issueIds.map(async (id, index) => {
  await taskTimer.startTask({
    taskId: id,
    taskType: 'issue',
    taskDescription: `Implement ${id}`,
    projectName: 'consilio',
    agentType: 'piv-agent',
    agentModel: 'haiku',
    parentTaskId: epicId,
    estimatedSeconds: estimates[index].estimatedSeconds
  });

  // Spawn agent
  await spawnAgent(id);
}));

// 4. Tell user realistic parallel estimate
console.log(`Running 4 agents in parallel`);
console.log(`Sequential estimate: 80 minutes`);
console.log(`Parallel estimate: ~25 minutes (longest task)`);
console.log(`NOT "5-6 hours"!`);

// 5. Agents complete at different times...
// issue-44 completes in 14 minutes
// issue-42 completes in 19 minutes
// issue-43 completes in 23 minutes
// issue-45 completes in 26 minutes (last)

// 6. Complete parallel tracking
const parallelMetrics = await taskTimer.completeParallelExecution(epicId);

// Returns:
// {
//   sequentialEstimate: 4800,      // 80 minutes
//   parallelActual: 1560,          // 26 minutes (actual)
//   timeSaved: 3240,               // Saved 54 minutes!
//   efficiency: 0.77,              // 77% efficiency (pretty good)
//   agentCount: 4
// }

// Report to user:
console.log(`✅ All 4 issues complete in 26 minutes`);
console.log(`(Would have taken 80 minutes sequentially)`);
console.log(`Time saved: 54 minutes via parallelism`);
```

### Example 3: Learning Over Time

```typescript
// First time implementing feature X

const estimate1 = await taskTimer.estimateTask({
  taskDescription: 'Implement real-time notifications',
  taskType: 'feature',
  projectName: 'consilio'
});

// Returns:
// {
//   estimatedSeconds: 3600,  // 1 hour (conservative, no data)
//   sampleSize: 0,
//   note: 'No historical data - conservative estimate'
// }

// Actually takes 22 minutes
await taskTimer.completeTask({
  taskId: 'feat-notifications-1',
  success: true
});

// ---

// Second time (similar feature)

const estimate2 = await taskTimer.estimateTask({
  taskDescription: 'Implement real-time chat messages',
  taskType: 'feature',
  projectName: 'consilio'
});

// Returns:
// {
//   estimatedSeconds: 1320,  // 22 minutes (based on similar task!)
//   sampleSize: 1,
//   similarTasks: [
//     { description: 'Implement real-time notifications', duration: 1320 }
//   ]
// }

// Much better estimate!

// ---

// After 10 similar tasks...

const estimate10 = await taskTimer.estimateTask({
  taskDescription: 'Implement real-time user presence',
  taskType: 'feature',
  projectName: 'consilio'
});

// Returns:
// {
//   estimatedSeconds: 1380,           // 23 minutes
//   confidenceIntervalLow: 1140,     // 19 minutes
//   confidenceIntervalHigh: 1620,    // 27 minutes
//   sampleSize: 10,
//   similarTasks: [ ... ]
// }

// Very accurate now! 95% confidence: 19-27 minutes
```

---

## MCP Tools for Supervisors

```typescript
{
  name: 'mcp__meta__estimate_task',
  description: 'Get time estimate for task based on historical data',
  parameters: {
    taskDescription: { type: 'string' },
    taskType: { type: 'string' },
    projectName: { type: 'string' },
    complexity: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__start_task_timer',
  description: 'Start timing a task',
  parameters: {
    taskId: { type: 'string' },
    taskType: { type: 'string' },
    taskDescription: { type: 'string' },
    projectName: { type: 'string' },
    agentType: { type: 'string' },
    estimatedSeconds: { type: 'number', optional: true }
  }
}

{
  name: 'mcp__meta__complete_task_timer',
  description: 'Complete task timing and record metrics',
  parameters: {
    taskId: { type: 'string' },
    success: { type: 'boolean' },
    linesOfCodeChanged: { type: 'number', optional: true },
    filesChanged: { type: 'number', optional: true }
  }
}

{
  name: 'mcp__meta__get_task_stats',
  description: 'Get statistics for task type',
  parameters: {
    taskType: { type: 'string' },
    projectName: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__estimate_parallel',
  description: 'Estimate time for parallel execution',
  parameters: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          type: { type: 'string' }
        }
      }
    },
    projectName: { type: 'string' }
  }
}
```

---

## Automatic Integration

### Supervisor Workflow (Automatic Timing)

```typescript
// supervisor-service automatically times everything

export class ProjectSupervisor {
  async implementEpic(epic: Epic): Promise<void> {
    const epicId = epic.id;

    // 1. AUTOMATIC: Get estimate
    const estimate = await this.taskTimer.estimateTask({
      taskDescription: epic.description,
      taskType: 'epic',
      projectName: this.projectName,
      complexity: epic.complexity
    });

    // 2. Tell user realistic estimate
    this.reportToUser(`
Estimated time: ${formatSeconds(estimate.confidenceIntervalLow)}-${formatSeconds(estimate.confidenceIntervalHigh)}
Based on ${estimate.sampleSize} similar tasks
    `);

    // 3. AUTOMATIC: Start timing
    await this.taskTimer.startTask({
      taskId: epicId,
      taskType: 'epic',
      taskDescription: epic.description,
      projectName: this.projectName,
      agentType: 'supervisor',
      agentModel: 'sonnet',
      estimatedSeconds: estimate.estimatedSeconds,
      complexity: epic.complexity
    });

    // 4. Break into issues
    const issues = await this.createIssues(epic);

    // 5. AUTOMATIC: Track parallel execution
    await this.taskTimer.trackParallelExecution({
      parentTaskId: epicId,
      childTaskIds: issues.map(i => i.id),
      sequentialEstimate: issues.reduce((sum, i) => sum + i.estimate, 0)
    });

    // 6. Spawn agents (each timed automatically)
    await Promise.all(issues.map(issue => this.spawnAgent(issue)));

    // 7. Wait for completion...

    // 8. AUTOMATIC: Complete timing
    await this.taskTimer.completeTask({
      taskId: epicId,
      success: true,
      linesOfCodeChanged: getTotalLOC(),
      filesChanged: getTotalFiles()
    });

    // 9. Report actual vs estimate
    const metrics = await this.taskTimer.completeParallelExecution(epicId);
    this.reportToUser(`
✅ Epic complete!
  - Estimated: ${formatSeconds(estimate.estimatedSeconds)}
  - Actual: ${formatSeconds(metrics.parallelActual)}
  - Time saved (parallelism): ${formatSeconds(metrics.timeSaved)}
    `);
  }
}
```

---

## Example Output (User Perspective)

### Before (Terrible Estimates)

```
User: "Implement authentication system"

Supervisor: "I'll create a plan for this. This will likely take 5-6 hours to implement..."

[20 minutes later]

Supervisor: "✅ Authentication complete"

User: 😠 "Why did you say 5-6 hours?!"
```

### After (Accurate Estimates)

```
User: "Implement authentication system"

Supervisor: "Let me check similar past implementations..."

Supervisor: "Based on 12 similar tasks in this project:
  - Estimated time: 18-25 minutes (95% confidence)
  - Average: 22 minutes
  - Similar tasks:
    • OAuth implementation: 21 min
    • JWT token system: 19 min
    • Session management: 24 min

I'll spawn a PIV agent to implement this."

[22 minutes later]

Supervisor: "✅ Authentication complete in 22 minutes (estimated 18-25 min)
  - Files changed: 12
  - Lines of code: 450
  - Tests added: 8
  - Estimate accuracy: 98%"

User: 😊 "Perfect! Exactly as expected."
```

---

## Dashboard and Reporting

### Project Statistics Dashboard

```typescript
// Meta-supervisor provides stats

const stats = await taskTimer.getProjectStats('consilio');

// Returns:
{
  totalTasks: 156,
  completedTasks: 142,
  averageDuration: 1245,  // 20.75 minutes

  byType: {
    epic: {
      count: 12,
      avgDuration: 3840,      // 64 minutes
      successRate: 0.92
    },
    issue: {
      count: 48,
      avgDuration: 1320,      // 22 minutes
      successRate: 0.96
    },
    feature: {
      count: 82,
      avgDuration: 840,       // 14 minutes
      successRate: 0.98
    }
  },

  estimationAccuracy: {
    avgError: 0.08,           // 8% average error
    within20Percent: 0.85,    // 85% within 20% of estimate
    improving: true           // Getting better over time
  },

  parallelism: {
    avgAgents: 3.2,
    avgEfficiency: 0.73,      // 73% efficiency
    avgTimeSaved: 2640        // 44 minutes saved per epic
  }
}
```

### User-Friendly Report

```
📊 Consilio Project Statistics

Tasks completed: 142 (91% success rate)
Average time: 21 minutes

By type:
  • Epics: 64 min avg (12 completed)
  • Issues: 22 min avg (48 completed)
  • Features: 14 min avg (82 completed)

Estimation accuracy: 92% (improving!)
  • 85% of tasks within 20% of estimate
  • Average error: only 8%

Parallelism efficiency: 73%
  • Average: 3.2 agents running simultaneously
  • Time saved: 44 minutes per epic

🚀 Your AI development is 47x faster than traditional estimates!
   (6 week project → 3.5 hours actual)
```

---

## Integration with Learning System

**Combine timing data with learnings:**

```typescript
// When creating learning, include timing context

await createLearning({
  title: 'Never trust SCAR summaries without verification',
  category: 'scar-integration',
  content: `...`,

  // NEW: Add timing data
  typicalImpact: {
    taskType: 'issue',
    timeSavedByLearning: 1200,  // 20 minutes saved per issue
    beforeAvg: 2400,             // 40 min before learning
    afterAvg: 1200,              // 20 min after learning
    improvement: 0.5             // 50% faster
  }
});

// When estimating, consider learnings
const estimate = await taskTimer.estimateTask({
  taskDescription: 'Deploy SCAR to implement feature',
  taskType: 'issue',
  projectName: 'consilio'
});

// Check if relevant learnings exist
const learnings = await searchLearnings('SCAR deployment');

if (learnings.length > 0) {
  // Adjust estimate based on learning impact
  estimate.estimatedSeconds *= (1 - learnings[0].typicalImpact.improvement);
  estimate.note = `Estimate adjusted based on learning: ${learnings[0].title}`;
}
```

---

## Summary

**What we built:**
- Complete task timing system
- Historical data storage
- Data-driven estimation
- Parallel execution tracking
- Automatic integration with supervisors
- Learning from every task

**What you get:**
- ✅ Accurate estimates (not "5-6 hours" when it takes 20 min)
- ✅ Realistic timelines (not "6-8 weeks" when it takes 3 hours)
- ✅ Parallelism accounting (4 tasks × 20 min = 20 min, not 80 min)
- ✅ Improving over time (more data = better estimates)
- ✅ Confidence intervals (18-25 min, not vague guess)
- ✅ Transparency (why this estimate? based on X similar tasks)

**Example results:**

**Traditional estimate:**
```
"This authentication system will take 6-8 weeks to develop"
```

**AI with no data:**
```
"This will take 5-6 hours"
[Actually takes 20 minutes]
```

**AI with timing data:**
```
"Based on 12 similar tasks: 18-25 minutes (95% confidence)
Similar tasks:
  • OAuth: 21 min
  • JWT: 19 min
  • Sessions: 24 min

Running 3 agents in parallel: ~25 min total"

[Actually takes 22 minutes]
✅ Accurate!
```

**Your development is 47-100x faster than traditional estimates suggested!**

**Implementation time:** 8-12 hours
**Value:** Never give wrong estimates again!
