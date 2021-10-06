require('./style.css');
import {Environment, Project, loadProjectDatabase$, Connection, 
    instanceOfSideEffects, renderTemplate, subscribeConnections, loadProjectURI$, Workflow, Component} from '@youwol/flux-core'
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { plugNotifications } from './notifier';


class ApplicationState{

    environment = new Environment(
        {   
            renderingWindow: window,
            executingWindow: window,
            console: { ...console, log: () => undefined }
        }
    )
    subscriptionStore = new Map<Connection,Subscription>()
    public readonly project$ = new Subject<Project>()

    workflow$ = new ReplaySubject<Workflow>(1)
    
    constructor(){}

    loadProjectById(projectId: string){

        loadProjectDatabase$( projectId, this.workflow$, this.subscriptionStore, this.environment).pipe(
            map(({ project }:{ project:Project }) => {
                let wf = project.workflow;
                [...wf.plugins, ...wf.modules].forEach( m=> instanceOfSideEffects(m) &&  m.apply() )
                return project
            })
        ).subscribe( project => this.project$.next(project))
    }
}

function run(state: ApplicationState){

    state.project$.subscribe( (project: Project) => {

        let rootComponent = project.workflow.modules
        .find( mdle => mdle.moduleId == Component.rootComponentId) as Component.Module

        const style = document.createElement('style');
        style.textContent = rootComponent.getFullCSS(project.workflow, {asString:true}) as string
        document.head.append(style);

        let contentDiv = document.getElementById("content") as HTMLDivElement     
        contentDiv.appendChild(rootComponent.getOuterHTML())
        renderTemplate(contentDiv, [rootComponent])

        applyHackRemoveDefaultStyles()
        
        let allSubscriptions = new Map()
        let allModules = [...project.workflow.modules,...project.workflow.plugins]
        subscribeConnections( allModules, project.workflow.connections, allSubscriptions )
    })
}

let projectId = new URLSearchParams(window.location.search).get("id")
let state = new ApplicationState()

state.loadProjectById(projectId)

plugNotifications(state.environment)

run(state)


function applyHackRemoveDefaultStyles(){
    /**
     * When defining ModuleFlux with views it is possible to associated default style.
     * Those default styles actually get higher priority than properties defined by grapes
     * using '#module-id{ ... }' => we remove the default.
     * Need to find a better way to associated default styles. 
     * For modules replicated afterward, this hack is not working.
     */
    let fluxElements = document.querySelectorAll('.flux-element')
    Array.from(fluxElements).forEach((element: HTMLDivElement) => {
        element.style.removeProperty("height")
        element.style.removeProperty("width")
    })
}