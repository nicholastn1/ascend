# Skills

Skills are concise, project-specific guides for recurring workflows in this repository.

## Index

| Skill | Description |
|-------|-------------|
| [add-api-endpoint](add-api-endpoint/SKILL.md) | Add or update a frontend API integration for the Rails backend |
| [add-dialog-flow](add-dialog-flow/SKILL.md) | Add a new modal workflow to the global dialog system |
| [add-resume-template](add-resume-template/SKILL.md) | Add a new resume template to the preview/gallery system |
| [add-zustand-store](add-zustand-store/SKILL.md) | Create a client-side Zustand store that matches project patterns |
| [bug-reproduction](bug-reproduction/SKILL.md) | Reproduce frontend bugs before fixing them |
| [batch-operations](batch-operations/SKILL.md) | Plan and execute large multi-file migrations safely |
| [git-platform](git-platform/SKILL.md) | Detect the git hosting platform before using PR/MR CLIs |

## Structure

```text
.claude/skills/
├── README.md
└── [skill-name]/
    └── SKILL.md
```

## When to Create a Skill

- A workflow has multiple project-specific steps that agents can easily miss
- There are important anti-patterns or architectural boundaries to remember
- The same task appears often enough to justify a reusable checklist

## Notes

- Keep skills short and specific to this repo
- Prefer current code and ADRs over historical docs when updating a skill
- If backend behavior matters, say clearly when the source of truth is in `ascend-api`
