#!/usr/bin/env python3
"""Authorize trusted main builds, then publish the already-scanned Docker archive."""
import hashlib,json,os,pathlib,re,subprocess,sys

def run(*args):
    return subprocess.check_output(args,text=True).strip()
def api(path): return json.loads(run('gh','api',path))
def output(key,value):
    with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write(f'{key}={value}\n')
def authorize():
    repo=os.environ['GITHUB_REPOSITORY']
    event=json.loads(pathlib.Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    if os.environ['GITHUB_EVENT_NAME']=='workflow_run':
        origin=event['workflow_run']
        if not (origin['conclusion']=='success' and origin['event']=='push' and origin['head_branch']=='main' and origin['head_repository']['full_name']==repo):
            raise SystemExit('Only successful same-repository main push CI may publish')
        sha=origin['head_sha']
    else:
        if os.environ['GITHUB_REF']!='refs/heads/main':raise SystemExit('Manual publishing requires main')
        sha=os.environ['GITHUB_SHA']
    if api(f'repos/{repo}/commits/main')['sha']!=sha:raise SystemExit('Stale build: main has advanced')
    runs=api(f'repos/{repo}/actions/workflows/check.yml/runs?event=push&branch=main&head_sha={sha}&per_page=100')['workflow_runs']
    eligible=[r for r in runs if r['head_sha']==sha and r['conclusion']=='success' and r['event']=='push']
    if not eligible:raise SystemExit('No successful required main CI run for this commit')
    registry=os.environ.get('OCIR_REGISTRY');namespace=os.environ.get('OCIR_NAMESPACE');component=os.environ['COMPONENT']
    if (registry,namespace,os.environ.get('OCIR_REPOSITORY'))!=('phx.ocir.io','axkouhjvgred','online-store/'+component):
        raise SystemExit('OCIR repository variables do not match the approved target')
    tag=f'{registry}/{namespace}/online-store/{component}:sha-{sha}-{os.environ["GITHUB_RUN_ID"]}-{os.environ["GITHUB_RUN_ATTEMPT"]}'
    output('sha',sha);output('tag',tag);output('ci_run',str(eligible[0]['id']))

def finalize():
    archive=pathlib.Path(os.environ['IMAGE_ARCHIVE']);tag=os.environ['IMAGE_TAG']
    sha=os.environ['SOURCE_SHA'];repo=os.environ['GITHUB_REPOSITORY']
    if api(f'repos/{repo}/commits/main')['sha']!=sha:raise SystemExit('Stale before publication: main advanced')
    out=pathlib.Path('.ci-output')
    for f in ['trivy-image.json','sbom.cdx.json']:
        json.loads((out/f).read_text())
    run('docker','load','--input',str(archive))
    image=json.loads(run('docker','image','inspect',tag))[0]
    if (image['Os'],image['Architecture'])!=('linux','arm64'):raise SystemExit('Incorrect image platform')
    pushed=run('docker','push',tag)
    match=re.search(r'digest: (sha256:[a-f0-9]{64})',pushed)
    if not match:raise SystemExit('No registry digest in Docker push result')
    digest=match[1];reference=tag.split(':')[0]+'@'+digest
    manifest=json.loads(run('docker','buildx','imagetools','inspect','--raw',reference))
    if manifest.get('config',{}).get('digest')!=image['Id']:
        raise SystemExit('Published config differs from the scanned artifact')
    hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [out/'trivy-image.json',out/'sbom.cdx.json']}
    evidence={'schema_version':1,'component':os.environ['COMPONENT'],'image':reference,'platform':'linux/arm64',
      'source_repository':repo,'source_sha':sha,'run_id':int(os.environ['GITHUB_RUN_ID']),
      'run_attempt':int(os.environ['GITHUB_RUN_ATTEMPT']),'workflow':'build-image.yml',
      'ci_run_id':int(os.environ['CI_RUN_ID']),'config_digest':image['Id'],
      'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
      'security_policy':'baseline-report-only','reports':hashes,
      'signing':'sigstore-keyless' if os.environ.get('ENABLE_EVIDENCE_SIGNING')=='true' else 'unsigned',
      'tools':json.loads(pathlib.Path('ci/tools.json').read_text()),
      'run_url':f'https://github.com/{repo}/actions/runs/{os.environ["GITHUB_RUN_ID"]}'}
    (out/'evidence.json').write_text(json.dumps(evidence,indent=2)+'\n')
    # Unsigned provenance record, not a cryptographic attestation.
    (out/'provenance.json').write_text(json.dumps({'_type':'https://in-toto.io/Statement/v1',
       'subject':[{'name':reference.split('@')[0],'digest':{'sha256':digest.split(':')[1]}}],
       'predicateType':'https://online-store.example/build-record/v1','predicate':evidence},indent=2)+'\n')
    with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:
        f.write(f'## Published {os.environ["COMPONENT"]}\n\n`{reference}`\n\nPlatform: linux/arm64. Source: `{sha}`.\n\nSecurity: baseline-report-only, not a vulnerability-free assertion. Evidence is retained for 90 days.\n')
if __name__=='__main__':
    {'authorize':authorize,'finalize':finalize}[sys.argv[1]]()
