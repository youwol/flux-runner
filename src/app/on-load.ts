require('./style.css');
import {Environment, Project, loadProjectDatabase$, Connection, 
    instanceOfSideEffects, renderTemplate, subscribeConnections} from '@youwol/flux-core'
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { plugNotifications } from './notifier';


class ApplicationState{

    environment = new Environment(
        {   
            renderingWindow: window,
            executingWindow: window,
            console: { ...console, ...{log: () => undefined} }
        }
    )
    subscriptionStore = new Map<Connection,Subscription>()
    public readonly project$ = new BehaviorSubject<Project>(undefined)

    constructor(public readonly projectId: string){

        let wfGetter = () => this.project$.getValue().workflow

        loadProjectDatabase$( projectId, wfGetter, this.subscriptionStore, this.environment).pipe(
            map(({ project }:{ project:Project }) => {
                let wf = project.workflow;
                [...wf.plugins, ...wf.modules].forEach( m=> instanceOfSideEffects(m) &&  m.apply() )
                return project
            })
        ).subscribe( project => this.project$.next(project))
    }
}

function run(state: ApplicationState){

    state.project$.pipe(
        filter( project => project != undefined)
    ).subscribe( (project) => {

        const style = document.createElement('style');
        style.textContent =  project.runnerRendering.style;
        document.head.append(style);

        let contentDiv = document.getElementById("content") as HTMLDivElement
        contentDiv.innerHTML = project.runnerRendering.layout
        
        let allModules = [...project.workflow.modules,...project.workflow.plugins]
        renderTemplate(contentDiv, allModules )

        let allSubscriptions = new Map()
        subscribeConnections(  allModules, project.workflow.connections, allSubscriptions )
    })
}

let projectId = new URLSearchParams(window.location.search).get("id")
let state = new ApplicationState(projectId)

plugNotifications(state.environment)

run(state)