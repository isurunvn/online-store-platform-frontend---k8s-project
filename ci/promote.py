#!/usr/bin/env python3
"""Create an image-only GitOps PR using verified evidence and a scoped App token."""
import json,os,pathlib,re,subprocess,tempfile
from evidence import verified,api
TARGET='isurunvn/online-store-platform-gitops---k8s-project'
def run(*args,cwd=None):return subprocess.check_output(args,cwd=cwd,text=True).strip()
component=os.environ['COMPONENT'];e=verified(component,os.environ['PUBLISH_RUN_ID'])
manifest=json.loads(run('docker','buildx','imagetools','inspect','--raw',e['image']))
if manifest.get('config',{}).get('digest') != e['config_digest']:
    raise SystemExit('Registry artifact no longer matches scanned config')
config=json.loads(run('docker','buildx','imagetools','inspect','--format','{{json .Image}}',e['image']))
if (config.get('os'),config.get('architecture')) != ('linux','arm64'):
    raise SystemExit('Registry image is not linux/arm64')
branch=f'promote/{component}/{e["run_id"]}-{e["run_attempt"]}' 
# Tokens are step-scoped. The source reader cannot write repositories.
os.environ['GH_TOKEN']=os.environ['GITOPS_TOKEN']
existing=api(f'repos/{TARGET}/pulls?state=open&per_page=100')
for pr in existing:
    if pr['head']['ref']==branch:
        print('Promotion already exists:',pr['html_url']);raise SystemExit(0)
    match=re.fullmatch(r'promote/'+re.escape(component)+r'/(\d+)-(\d+)',pr['head']['ref'])
    if match and (int(match[1]),int(match[2]))>(e['run_id'],e['run_attempt']):raise SystemExit('A newer promotion already exists')
with tempfile.TemporaryDirectory() as tmp:
    run('gh','repo','clone',TARGET,tmp,'--','--depth','1','--branch','main')
    root=pathlib.Path(tmp);path=root/'apps'/component/'base/deployment.yaml'
    original=path.read_text()
    if e['image'] in original:print('Digest already deployed in Git');raise SystemExit(0)
    updated,n=re.subn(r'(?m)^(\s*(?:- )?image:) .+$',lambda m:m[1]+' '+e['image'],original)
    if n!=1:raise SystemExit('Expected exactly one image field')
    run('git','switch','-c',branch,cwd=tmp);path.write_text(updated)
    meta=root/'releases'/f'{component}.json';meta.parent.mkdir(exist_ok=True);meta.write_text(json.dumps(e,indent=2)+'\n')
    # Run trusted target-main validation, not scripts supplied in a PR.
    run('python3','ci/validate.py',cwd=tmp)
    run('git','diff','--check',cwd=tmp)
    run('git','config','user.name','online-store-promotion[bot]',cwd=tmp)
    run('git','config','user.email','online-store-promotion@users.noreply.github.com',cwd=tmp)
    run('git','add',str(path.relative_to(root)),str(meta.relative_to(root)),cwd=tmp)
    run('git','commit','-m',f'Promote {component} {e["source_sha"][:12]}',cwd=tmp)
    # Re-check freshness immediately before the branch write.
    os.environ['GH_TOKEN']=os.environ['SOURCE_TOKEN']
    if api(f'repos/{e["source_repository"]}/commits/main')['sha']!=e['source_sha']:raise SystemExit('Main advanced before promotion')
    os.environ['GH_TOKEN']=os.environ['GITOPS_TOKEN']
    run('git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','push','origin',f'HEAD:refs/heads/{branch}',cwd=tmp)
    body=root/'pr-body.md'
    body.write_text(f'''Publish {component} from {e['source_repository']} at `{e['source_sha']}`.

Image: `{e['image']}`
Platform: `{e['platform']}`
Build: {e['run_url']}
Security policy: **{e['security_policy']}**. Vulnerability findings require review; this is not a clean-security assertion.
Evidence and SBOM: release-evidence artifact in the linked build (90-day retention).

Only this application's image and its evidence record change. No Applications are activated.
Merge only after GitOps validation, Promotion evidence, and human review. Argo CD deploys after merge.
''')
    url=run('gh','pr','create','--repo',TARGET,'--base','main','--head',branch,'--title',f'Promote {component} {e["source_sha"][:12]}','--body-file',str(body))
    print(url)
    # Close superseded bot-owned candidates, never force-push or merge them.
    for pr in existing:
        if pr['user']['type']=='Bot' and re.fullmatch(r'promote/'+re.escape(component)+r'/\d+-\d+',pr['head']['ref']):
            run('gh','pr','close',str(pr['number']),'--repo',TARGET,'--comment','Superseded by '+url)
