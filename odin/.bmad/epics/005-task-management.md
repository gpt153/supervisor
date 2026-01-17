# Epic 005: Task Management

**Status:** Ready
**Priority:** High
**Estimated Effort:** 3-4 days
**Target:** Week 3 (Jan 29 - Feb 4)
**Depends On:** Epic 001, 003 (for AI prioritization)

---

## Overview

Implement comprehensive task management system with CRUD API, intelligent prioritization, and email-task linking.

---

## Goals

1. Full CRUD API for tasks
2. AI-powered priority scoring
3. Link tasks to source emails
4. Task list views with filters
5. Task status tracking

---

## Technical Requirements

### Task Service (`src/odin/services/task_service.py`)

```python
class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.ai_service = AIService()

    async def create_task(self, task_data: TaskCreate) -> Task:
        """Create new task with AI prioritization"""
        task = Task(**task_data.model_dump())

        # AI priority scoring
        priority = await self.ai_service.score_task_priority(task)
        task.priority = priority

        self.session.add(task)
        await self.session.commit()
        return task

    async def create_task_from_email(self, email_id: int, action_item: str) -> Task:
        """Create task from email action item"""
        email = await self.session.get(Email, email_id)

        task = Task(
            user_id=email.user_id,
            email_id=email_id,
            title=action_item,
            description=f"From email: {email.subject}",
            source="email",
            priority=email.priority,  # Inherit email priority
        )

        self.session.add(task)
        await self.session.commit()
        return task
```

### API Endpoints (`src/odin/api/routes/tasks.py`)

```python
@router.post("")
async def create_task(task_data: TaskCreate, session: AsyncSession = Depends(get_db)):
    """Create new task"""

@router.get("")
async def list_tasks(status: str = None, priority: int = None, session: AsyncSession = Depends(get_db)):
    """List tasks with filters"""

@router.get("/{task_id}")
async def get_task(task_id: int, session: AsyncSession = Depends(get_db)):
    """Get single task"""

@router.put("/{task_id}")
async def update_task(task_id: int, task_data: TaskUpdate, session: AsyncSession = Depends(get_db)):
    """Update task"""

@router.delete("/{task_id}")
async def delete_task(task_id: int, session: AsyncSession = Depends(get_db)):
    """Delete task"""

@router.post("/{task_id}/complete")
async def complete_task(task_id: int, session: AsyncSession = Depends(get_db)):
    """Mark task as complete"""
```

---

## Acceptance Criteria

- [ ] CRUD operations work for tasks
- [ ] Tasks linked to emails via foreign key
- [ ] AI priority scoring functional
- [ ] Filter tasks by status, priority, tags, due date
- [ ] Todoist sync (nice to have)
- [ ] Tests for all operations

---

**Epic Owner:** SCAR
**Estimated Completion:** 2026-02-02
