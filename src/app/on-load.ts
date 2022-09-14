require('./style.css')
import {
    Environment,
    Project,
    loadProjectDatabase$,
    Connection,
    instanceOfSideEffects,
    renderTemplate,
    subscribeConnections,
    Workflow,
    Component,
    loadProject$,
    createObservableFromFetch,
} from '@youwol/flux-core'
import { ReplaySubject, Subject, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { plugNotifications } from './notifier'

// this variable has been defined in the main.ts to initiate displaying dependencies fetching
const loadingScreen = window['fluRunnerLoadingScreen']

class ApplicationState {
    environment = new Environment({
        renderingWindow: window,
        executingWindow: window,
        console: { ...console, log: () => undefined },
    })
    subscriptionStore = new Map<Connection, Subscription>()
    public readonly project$ = new Subject<Project>()

    workflow$ = new ReplaySubject<Workflow>(1)

    loadProjectById(projectId: string) {
        loadProjectDatabase$(
            projectId,
            this.workflow$,
            this.subscriptionStore,
            this.environment,
            (cdnEvent) => loadingScreen.next(cdnEvent),
        )
            .pipe(
                map(({ project }: { project: Project }) =>
                    applySideEffects(project),
                ),
            )
            .subscribe((project) => this.project$.next(project))
    }

    loadProjectByUrl(url: string) {
        loadProject$(
            createObservableFromFetch(new Request(url)),
            this.workflow$,
            this.subscriptionStore,
            this.environment,
            (cdnEvent) => loadingScreen.next(cdnEvent),
        )
            .pipe(
                map(({ project }: { project: Project }) =>
                    applySideEffects(project),
                ),
            )
            .subscribe((project) => this.project$.next(project))
    }
}

function applySideEffects(project: Project) {
    const wf = project.workflow
    ;[...wf.plugins, ...wf.modules].forEach(
        (m) => instanceOfSideEffects(m) && m.apply(),
    )
    return project
}

function run(state: ApplicationState) {
    state.project$.subscribe((project: Project) => {
        loadingScreen.done()
        const rootComponent = project.workflow.modules.find(
            (mdle) => mdle.moduleId == Component.rootComponentId,
        ) as Component.Module

        const style = document.createElement('style')
        style.textContent = rootComponent.getFullCSS(project.workflow, {
            asString: true,
        }) as string
        document.head.append(style)

        const contentDiv = document.getElementById('content') as HTMLDivElement
        contentDiv.appendChild(rootComponent.getOuterHTML())
        renderTemplate(contentDiv, [rootComponent])

        applyHackRemoveDefaultStyles()

        const allSubscriptions = new Map()
        const allModules = [
            ...project.workflow.modules,
            ...project.workflow.plugins,
        ]
        subscribeConnections(
            allModules,
            project.workflow.connections,
            allSubscriptions,
        )
    })
}

const appState = new ApplicationState()

appState.loadProjectById(new URLSearchParams(window.location.search).get('id'))

plugNotifications(appState.environment)

run(appState)

function applyHackRemoveDefaultStyles() {
    /**
     * When defining ModuleFlux with views it is possible to associated default style.
     * Those default styles actually get higher priority than properties defined by grapes
     * using '#module-id{ ... }' => we remove the default.
     * Need to find a better way to associated default styles.
     * For modules replicated afterward, this hack is not working.
     */
    const fluxElements = document.querySelectorAll('.flux-element')
    Array.from(fluxElements).forEach((element: HTMLDivElement) => {
        element.style.removeProperty('height')
        element.style.removeProperty('width')
    })
}
export {}
