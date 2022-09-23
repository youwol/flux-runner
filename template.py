import shutil
from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import Template, PackageType, Dependencies, \
    RunTimeDeps, generate_template, DevServer, Bundles, MainModule
from youwol_utils import parse_json

folder_path = Path(__file__).parent

pkg_json = parse_json(folder_path / 'package.json')


template = Template(
    path=folder_path,
    type=PackageType.Application,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals={
                '@youwol/flux-view': '^1.0.3',
                'lodash': '^4.17.15',
                '@youwol/cdn-client': '^1.0.2',
                '@youwol/flux-core': '^0.2.1',
                'rxjs': '^6.5.5'
            }
        )
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile='index.html',
            loadDependencies=['@youwol/flux-view', 'lodash', '@youwol/cdn-client', '@youwol/flux-core', 'rxjs']
        )
    ),
    userGuide=True,
    devServer=DevServer(
        port=3011
    )
)

generate_template(template)

shutil.copyfile(
    src=folder_path / '.template' / 'src' / 'auto-generated.ts',
    dst=folder_path / 'src' / 'auto-generated.ts'
)

for file in ['README.md', '.gitignore', '.npmignore', '.prettierignore', 'LICENSE', 'package.json',
             'tsconfig.json', 'webpack.config.ts']:
    shutil.copyfile(
        src=folder_path / '.template' / file,
        dst=folder_path / file
    )


