# frontend delivery

Full architecture, setup, policy, rollback and recovery:
[GitOps delivery guide](https://github.com/isurunvn/online-store-platform-gitops---k8s-project/blob/main/DELIVERY.md).
Merge the GitOps implementation first so its validator/evidence workflow exists on main.

## Workflows

- `check.yml`: PRs into main and main pushes; tests/build, Gitleaks, local Semgrep
  rules, Trivy dependencies/Dockerfile findings and native Docker build validation.
  No prod environment or registry credentials. Required check: **Application CI**.
- `build-image.yml`: successful same-repository main push CI, or manual dispatch
  after equivalent CI verification. Builds one linux/arm64 Docker archive, scans
  it, generates SBOM, loads/pushes it without rebuilding, and checks remote config
  digest. Main freshness is checked before build and publication.
- `promote-image.yml`: successful publication triggers verified build-artifact and
  registry checks, then a component-only GitOps PR. No direct main push or cluster
  commands. A missing App configuration fails promotion visibly; retry promotion
  for the existing successful build, do not rebuild merely to retry promotion.
- `release.yml`: optional published semantic tag such as v1.1.0; attaches identity
  of an existing verified image, with no build, image push or deployment.

## Required owner configuration

Keep `prod` variables OCIR_REGISTRY=phx.ocir.io, OCIR_NAMESPACE=axkouhjvgred,
OCIR_REPOSITORY=online-store/frontend; secrets OCIR_USERNAME and OCIR_AUTH_TOKEN.
Scope the OCI publisher to the existing repositories, and keep Kubernetes pull-only
credentials separate. This task does not rotate or change identities.

Create a private promotion-writer GitHub App installed ONLY on GitOps, with Contents
read/write and Pull requests read/write. Set repository variable PROMOTION_APP_ID
and secret PROMOTION_APP_PRIVATE_KEY here. Tokens are restricted to that repo and
expire automatically. GitOps additionally needs a separate read-only evidence App;
see the central guide. No broad PAT is needed.

Restrict prod to main and protect main with Application CI and human review. No
security boundary is claimed until repository settings enforce these checks.

## Security evidence

See SECURITY-POLICY.md. Trivy severity is initially **baseline-report-only**; reports
must be triaged, not described as a clean security pass. Tests, selected SAST rules,
secret findings and scanner execution failures block. Evidence/SBOM artifacts are
retained for 90 days; ordinary CI reports for 14 days. Preserve important evidence.

Optional variable ENABLE_EVIDENCE_SIGNING=true enables Cosign keyless signing of
release evidence containing the exact image digest. Public Sigstore logs expose
signing identity metadata; owner opt-in is required. Consumers verify signed evidence
against the expected workflow and GitHub issuer. This is not OKE admission enforcement
or an OCI-native image signature. The path is implemented but requires a controlled
live signing test before mandatory enforcement. Unsigned evidence is accepted during
baseline rollout. The provenance JSON is an unsigned build record, not a SLSA claim.

No CI workflow receives kubeconfig or applies Kubernetes state. After reviewed
GitOps merge, Argo CD deploys. Run the read-only GitOps smoke script separately.
