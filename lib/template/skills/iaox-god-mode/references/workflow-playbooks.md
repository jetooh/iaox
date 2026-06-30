# Workflow Playbooks

God Mode selects one of four primary workflows based on the situation.

## Selection guide

| Situation | Workflow |
|-----------|----------|
| New story from an epic        | Story Development Cycle (SDC) |
| QA found issues, need iteration | QA Loop |
| Complex feature needs a spec  | Spec Pipeline → then SDC |
| Joining an existing codebase  | Brownfield Discovery |
| Simple bug fix                | SDC in YOLO mode |

---

## 1. Story Development Cycle (SDC) — PRIMARY

Four phases, one per agent:

| Phase | Agent | Task | Output | Status |
|-------|-------|------|--------|--------|
| 1. Create   | `@sm`  | `create-next-story` | `{epic}.{story}.story.md` | Draft |
| 2. Validate | `@po`  | `validate-next-story` | GO / NO-GO (10-point) | Draft → Ready |
| 3. Implement| `@dev` | `dev-develop-story` | code + tests | Ready → InProgress |
| 4. QA Gate  | `@qa`  | `qa-gate` | PASS / CONCERNS / FAIL / WAIVED | InProgress → InReview → Done |

Validation needs ≥7/10 to pass. Implementation modes: Interactive / YOLO / Pre-Flight.

---

## 2. QA Loop — iterative review

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

| Verdict | Next |
|---------|------|
| APPROVE | Complete, mark Done |
| REJECT  | `@dev` fixes, re-review |
| BLOCKED | Escalate immediately |

Escalation triggers: max iterations reached, verdict blocked, repeated fix failure.

---

## 3. Spec Pipeline — pre-implementation

Turns informal requirements into an executable spec.

| Phase | Agent | Output | Skip if |
|-------|-------|--------|---------|
| 1. Gather    | `@pm`        | `requirements.json` | never |
| 2. Assess    | `@architect` | `complexity.json` | source=simple |
| 3. Research  | `@analyst`   | `research.json` | SIMPLE class |
| 4. Write Spec| `@pm`        | `spec.md` | never |
| 5. Critique  | `@qa`        | `critique.json` | never |
| 6. Plan      | `@architect` | `implementation.yaml` | if APPROVED |

Complexity classes: SIMPLE (≤8, 3 phases) · STANDARD (9–15, all 6) · COMPLEX (≥16, 6 + revision).
Critique verdicts: APPROVED (≥4.0) · NEEDS_REVISION (3.0–3.9) · BLOCKED (<3.0).

**Constitutional gate (No Invention):** every statement in `spec.md` must trace
to FR-* / NFR-* / CON-* / a research finding.

---

## 4. Brownfield Discovery — legacy assessment

10 phases producing a technical-debt assessment:

- Phases 1–3 (collect): `@architect` → architecture; `@data-engineer` → schema audit; `@ux-design-expert` → frontend spec.
- Phases 4–7 (draft + validate): `@architect` draft → specialist reviews → `@qa` gate (APPROVED / NEEDS WORK).
- Phases 8–10 (finalize): `@architect` final → `@analyst` executive report → `@pm` epic + stories.

---

## Orchestration tips

- Always name the workflow and the first agent before executing.
- Keep one workflow active at a time per story.
- On any gate failure, return to the responsible agent with explicit feedback.
