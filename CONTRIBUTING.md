# Contributing to Agent Ego Engine

Thank you for your interest in contributing to `agent-ego`! We welcome contributions that maintain our high standard of craftsmanship.

## Development Workflow

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kapitan00000978-sketch/agent-ego-engine.git
   cd agent-ego-engine
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Build the TypeScript source**:
   ```bash
   npm run build
   ```

4. **Run the test suite**:
   ```bash
   npm test
   ```

## Contribution Guidelines

- **Zero-Slop Rule**: All PRs must pass the `agent-ego audit` with a score of **>= 9.0/10**. PRs with `// TODO` comments, `any` casts without explicit bounds, or untyped interfaces will be blocked.
- **AST Transformer Safety**: Any modification to `AutoFixer` must include tests verifying that functions with runtime side-effects are preserved and never deleted.
- **Cross-Platform Testing**: Ensure tests pass across both Linux and Windows environments.
