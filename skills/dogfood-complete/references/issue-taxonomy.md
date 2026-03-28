# Issue Taxonomy & Exploration Checklist

1. [Issue Categories](#issue-categories)
2. [Severity Levels](#severity-levels)
3. [Exploration Checklist](#exploration-checklist)
4. [Related References](#related-references)

## Issue Categories

Organize your findings by these primary categories:

### Functional
Broken features or failed interactions.
- A feature doesn't work as expected.
- Dead links or 404s.
- Form submissions fail.
- Error states aren't handled gracefully.
- CRUD operations (Create, Read, Update, Delete) fail.

### UX (User Experience)
Confusion or friction during interaction.
- Confusing navigation or wording.
- Missing feedback (e.g., no loading indicator).
- Unclear error messages.
- Inconsistent behavior across sections.
- Accessibility issues (missing alt text, poor contrast).

### Visual
Layout and aesthetic issues.
- Layout breaks or overlapping elements.
- Truncated text or overflow issues.
- Missing images or icons.
- Responsive issues (doesn't work at mobile/tablet sizes).

### Console & Network
Under-the-hood technical failures.
- Uncaught JS exceptions.
- Failed network requests (4xx/5xx).
- Deprecation warnings or excessive console logs.

### Content
Textual and information accuracy issues.
- Typos or grammatical errors.
- Placeholder text ("Lorem Ipsum") left in.
- Outdated or incorrect information.

## Severity Levels

Assign a severity level to each issue:

- **Critical**: App is unusable or a core feature is completely broken.
- **Major**: Significant feature is broken, but workaround exists.
- **Minor**: Small bug, annoyance, or cosmetic issue.
- **Info**: Suggestion for improvement or UX enhancement.

## Exploration Checklist

Perform these checks on every page or section:

- [ ] **Navigation**: Can you reach every section? Do breadcrumbs work?
- [ ] **Forms**: Test every field, every validation, and the submit flow.
- [ ] **Authentication**: Log in, log out, password reset, and session expiry.
- [ ] **Error Handling**: What happens if you submit empty forms? Or invalid data?
- [ ] **Empty States**: What does a dashboard look like with no data?
- [ ] **Edge Cases**: Large text, missing data, slow network.
- [ ] **Responsive**: Check the page at 320px, 768px, and 1440px widths.
- [ ] **Console Errors**: Run `agent-browser errors` at every step.

## Related References
- [QA Report Generation](qa-report-generation.md)
- [Console Error Detection](console-error-detection.md)
- [Exploration Protocol](exploration-protocol.md)
