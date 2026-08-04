# Module 7: Post Composition

## Scope

Module 7 introduces the first end-to-end post composition workflow for the Sched backend. The implementation follows the existing layered architecture:

- Routes: HTTP entrypoints under src/routes/v1
- Controllers: request parsing and response shaping under src/controllers
- Services: authorization and business rules under src/services
- Repositories: Prisma persistence under src/repositories
- Validators: request validation under src/validators

## Implemented behavior

The initial Module 7 implementation provides:

- Create draft posts for a workspace
- List posts in a workspace
- Read a single post
- Update a post authored by the current user
- Delete a post authored by the current user
- Enforce workspace membership checks before post access

## Validation commands

Once Docker, PostgreSQL, and Redis are available, validate the module with:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm test -- --runInBand
```

For focused verification of the post flow:

```bash
cd backend
npx jest src/tests/post.test.js --runInBand --detectOpenHandles --verbose
```

## Notes

- The post routes are protected by the existing JWT auth middleware.
- The post service enforces workspace membership and author-only mutation rules.
- The implementation is intentionally minimal and follows the patterns already established by Auth and Workspace modules.
