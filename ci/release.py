#!/usr/bin/env python3
"""Attach verified existing build evidence to an optional semantic release. No build."""
import json,os,pathlib,re,subprocess,tempfile,urllib.parse
from evidence import api,verified
repo=os.environ['GITHUB_REPOSITORY'];tag=os.environ['RELEASE_TAG']
if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?',tag):raise SystemExit('Expected a semantic version tag')
sha=api(f'repos/{repo}/commits/{urllib.parse.quote(tag,safe="")}')['sha']
runs=api(f'repos/{repo}/actions/workflows/build-image.yml/runs?head_sha={sha}&status=success&per_page=100')['workflow_runs']
if not runs:raise SystemExit('No successful existing publication for this release commit; do not rebuild just for release')
e=verified(os.environ['COMPONENT'],runs[0]['id'],require_current=False)
if e['source_sha']!=sha:raise SystemExit('Release/build source mismatch')
with tempfile.TemporaryDirectory() as tmp:
 p=pathlib.Path(tmp)/'image-evidence.json';p.write_text(json.dumps(e,indent=2)+'\n')
 subprocess.run(['gh','release','upload',tag,str(p),'--repo',repo],check=True)
print('Release records existing image:',e['image'])
