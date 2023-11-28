from youwol.app.environment import YouwolEnvironment
from youwol.app.environment.models import IPipelineFactory
from youwol.app.environment.models_project import BrowserApp, Execution, OpenWith, BrowserAppGraphics, Link
from youwol.pipelines.pipeline_typescript_weback_npm import pipeline, PipelineConfig
from youwol.utils.context import Context


class PipelineFactory(IPipelineFactory):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, _env: YouwolEnvironment, context: Context):
        config = PipelineConfig(
            with_tags=["flux"],
            target=BrowserApp(
                displayName="Flux Runner",
                links=[
                    Link(name="doc", url="dist/docs/index.html"),
                    Link(name="coverage", url="coverage/lcov-report/index.html"),
                    Link(name="bundle-analysis", url="dist/bundle-analysis.html")
                ],
                execution=Execution(
                    standalone=False,
                    parametrized=[
                        OpenWith(
                            match={"kind": "flux-project"},
                            parameters={"id": 'rawId'}
                        )
                    ]
                ),
                graphics=BrowserAppGraphics(
                    appIcon={'class': 'fas fa-tools fa-2x'},
                    fileIcon={'class': 'fas fa-tools'},
                    background={
                        "style": {
                            "width": '100%',
                            "height": '100%',
                            "opacity": 0.3,
                            "z-index": -1,
                        }
                    }
                ),
            )
        )
        return await pipeline(config, context)
