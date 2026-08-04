# Module 8: Scheduling Engine

## Overview
The scheduling engine introduces queued post publication for workspace posts. A schedule record is created for a post and a social account, then a BullMQ job is queued for the scheduled time.

## API Endpoints
- POST /api/v1/schedules
- GET /api/v1/schedules/:id
- GET /api/v1/schedules/workspace/:workspaceId
- DELETE /api/v1/schedules/:id

## Components
- SchedulingService: create, read, delete, and process schedules
- scheduler.queue.js: BullMQ queue wrapper with Redis connection
- scheduler.worker.js: processes delayed jobs and updates post/schedule/destination status
- ScheduleRepository: persistence for schedules and destinations
- SocialAccountRepository: social account lookup

## Retry Behavior
Jobs retry up to 3 attempts with exponential backoff.
