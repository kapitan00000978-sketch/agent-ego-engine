# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Security is a core design pillar of `agent-ego`.

If you discover a security vulnerability within `agent-ego-engine` or any of its subcomponents (such as local dashboard exposure, AST injection, or bypass vectors):

1. **Do NOT open a public issue.**
2. Report the vulnerability privately via GitHub Security Advisories or directly to the project maintainer (`Kapitan`).
3. Include steps to reproduce, affected versions, and proof-of-concept code.
4. We aim to acknowledge reports within 24 hours and issue a patched release promptly.

## Security Guarantees & Non-Goals

- **Loopback Enforcement**: The local dashboard server strictly binds to `127.0.0.1` and will never bind to `0.0.0.0`.
- **Zero Telemetry**: `agent-ego` executes 100% locally on your machine. No source code, prompts, or audit metrics are ever transmitted to external servers.
