# Changelog

All notable changes to the **Agent Ego Engine** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-11

### Added
- **Standardized ProfessionSpec**: Unified format for all professions (`checklist`, `verifiers`, `testFixtures`, `group: A/B/C`).
- **Group A FrontendLeadSpec**: Deterministic layout shift (CLS), viewport overflow detection, and `@axe-core/playwright` accessibility audits.
- **Machine-Readable Diagnostics**: Added `--json` flag to `agent-ego audit` producing structured `file:line -> rule -> remedy` reports.
- **AST-Based Surgical Auto-Fixer**: Side-effect preserving transformer with automatic rollback on syntax regression.
- **Deterministic Hard Gate Scoring**: Zero-tolerance compiler/linter error gating with configurable `N/A` policy.
- **Empirical Benchmark Suite**: Automated comparative benchmark runner (`src/benchmark/benchmark-runner.ts`).
- **Local Dashboard Security**: Hardened local lab server bound strictly to `127.0.0.1` with DNS rebinding and Origin header defense.
- **Universal Multi-Platform Init**: Single-command initialization across Antigravity, Cursor, Git hooks, and GitHub Actions.
- **GitHub Actions CI**: Automated continuous integration running full test suites on Linux.
- **Dual-Language Documentation**: Complete English and Uzbek (`README.uz.md`) specifications.
- **Official MIT License**.
