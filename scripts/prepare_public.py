"""Build a public-only artifact with a deterministic software release fingerprint."""
import hashlib
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def prepare(destination=None):
    destination=Path(destination) if destination else ROOT/'public'
    destination.mkdir(parents=True,exist_ok=True)
    files=sorted([ROOT/'index.html',ROOT/'style.css',ROOT/'icon.svg',ROOT/'manifest.webmanifest',ROOT/'apple-touch-icon.png',*ROOT.glob('*.js')])
    digest=hashlib.sha256()
    for path in files:
        digest.update(path.name.encode()+b'\0'+path.read_bytes()+b'\0')
    build=digest.hexdigest()
    for path in files:
        shutil.copyfile(path,destination/path.name)
    updates=destination/'updates.js'
    # Replace only the constant, preserving the development-mode guard literal.
    updates.write_text(updates.read_text(encoding='utf-8').replace("BUILD_ID='__APP_BUILD_ID__'", "BUILD_ID='"+build+"'"),encoding='utf-8')
    (destination/'version.json').write_text(json.dumps({'build':build})+'\n',encoding='utf-8')
    (destination/'data').mkdir(exist_ok=True)
    shutil.copyfile(ROOT/'data'/'official-fixed.json',destination/'data'/'official-fixed.json')
    (destination/'.nojekyll').touch()
    print('Public software release: '+build)
    return build

if __name__=='__main__':
    prepare()
