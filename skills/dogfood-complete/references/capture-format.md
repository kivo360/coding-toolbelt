# Capture Format & Action Schema

1. [Introduction](#introduction)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Action Map](#action-map)
4. [Step Assembly](#step-assembly)
5. [Ref Metadata Strategy](#ref-metadata-strategy)
6. [Related References](#related-references)

## Introduction

The JSON action log is a structured history of your exploration session. It provides the source data for both the QA report and the generation of Playwright test scripts.

## TypeScript Interfaces

```typescript
export interface DogfoodStep {
  seq: number;
  action: {
    type: 'goto' | 'click' | 'fill' | 'type' | 'select' | 'assert' | 'scroll';
    target?: {
      ref: string;      // e.g., "@e1"
      role?: string;    // e.g., "button"
      name?: string;    // e.g., "Submit"
      label?: string;   // e.g., "Email Address"
    };
    value?: string;     // e.g., text filled or assertion text
  };
  evidence: {
    screenshot?: string; // Path to annotated screenshot
    videoTimestamp?: number; // Seconds into current recording
    consoleErrors: string[];
    networkFailures: string[];
  };
  pageState: {
    url: string;
    title: string;
  };
  notes: string;
}
```

## Action Map

Mapping `agent-browser` commands to the `action` schema:

| Command | Action Type | Example |
|---------|-------------|---------|
| `open URL` | `goto` | `{ type: 'goto', value: 'http://localhost:3000' }` |
| `click @e1` | `click` | `{ type: 'click', target: { ref: '@e1', role: 'button', name: 'Save' } }` |
| `fill @e2 "text"`| `fill` | `{ type: 'fill', target: { ref: '@e2', role: 'textbox', name: 'Email' }, value: 'test@test.com' }` |
| `find role button click` | `click` | `{ type: 'click', target: { role: 'button', name: 'Submit' } }` |
| `wait --text "Success"` | `assert`| `{ type: 'assert', value: 'Success' }` |

## Step Assembly

As you execute commands, append each step to an array in memory or a file:

```json
[
  {
    "seq": 1,
    "action": { "type": "goto", "value": "http://localhost:3000/" },
    "evidence": {
      "screenshot": "dogfood-output/screenshots/step-1.png",
      "consoleErrors": []
    },
    "pageState": { "url": "http://localhost:3000/", "title": "Home" }
  }
]
```

## Ref Metadata Strategy

The `refs` mapping allows `agent-browser` to correlate specific elements with semantic information. When you run `snapshot -i`, you get the `@eN` references. Use the `target` metadata (role, name, label) gathered from these refs to create robust Playwright locators.

## Related References
- [Exploration Protocol](exploration-protocol.md)
- [Video Recording for Evidence](video-evidence.md)
- [QA Report Generation](qa-report-generation.md)
