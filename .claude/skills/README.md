# Skills

Skills are step-by-step guides for recurring tasks in this project.

## Index

| Skill | Description |
|-------|-------------|
| [add-resume-template](add-resume-template/SKILL.md) | How to add a new resume template component |
| [add-api-endpoint](add-api-endpoint/SKILL.md) | How to add a new oRPC API endpoint |
| [bug-reproduction](bug-reproduction/SKILL.md) | How to reproduce and fix bugs |

## Structure

```
skills/
└── [skill-name]/
    └── SKILL.md
```

## When to Create a Skill

- Task follows a specific pattern in this project
- Multiple steps that are easy to forget
- Anti-patterns that should be avoided
- Onboarding material for new contributors

## Template

```markdown
# Skill: [Name]

## When to Use

- [Situation 1]
- [Situation 2]

## Step by Step

### 1. [First Step]

\`\`\`bash
# commands or code
\`\`\`

### 2. [Second Step]

\`\`\`bash
# commands or code
\`\`\`

## Anti-Patterns

- [Bad practice]

## Good Practices

- [Good practice]
```

## Adding Skills

In Claude Code, use the interactive command:
```
/add-skill
```

This will ask clarifying questions and populate the skill with context.
