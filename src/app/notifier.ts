import {
    Environment,
    ErrorLog,
    ModuleError,
    Process,
    ProcessMessage,
    ProcessMessageKind,
} from '@youwol/flux-core'
import {
    attr$,
    HTMLElement$,
    render,
    Stream$,
    VirtualDOM,
} from '@youwol/flux-view'
import { Observable } from 'rxjs'
import { delay, filter, take } from 'rxjs/operators'

/**
 * Most of this file is replicated from flux-builder => factorization needed
 */
export function plugNotifications(environment: Environment) {
    environment.errors$
        .pipe(filter((log: ErrorLog) => log.error instanceof ModuleError))
        .subscribe((log: ErrorLog<ModuleError>) =>
            Notifier.error({
                message: log.error.message,
                title: log.error.module.Factory.id,
            }),
        )
    environment.processes$.subscribe((p: Process) => {
        let classesIcon = {
            [ProcessMessageKind.Scheduled]: 'fas fa-clock px-2',
            [ProcessMessageKind.Started]: 'fas fa-cog fa-spin px-2',
            [ProcessMessageKind.Succeeded]: 'fas fa-check fv-text-success px-2',
            [ProcessMessageKind.Failed]: 'fas fa-times fv-text-error px-2',
            [ProcessMessageKind.Log]: 'fas fa-cog fa-spin px-2',
        }
        let doneMessages = [
            ProcessMessageKind.Succeeded,
            ProcessMessageKind.Failed,
        ]
        Notifier.notify({
            title: p.title,
            message: attr$(p.messages$, (step: ProcessMessage) => step.text),
            classIcon: attr$(
                p.messages$,
                (step: ProcessMessage) => classesIcon[step.kind],
            ),
            timeout: p.messages$.pipe(
                filter((m) => doneMessages.includes(m.kind)),
                take(1),
                delay(1000),
            ),
        })
    })
}

/**
 * This class provides a notification system that popups message in the
 * HTML document.
 *
 * For now, only module's errors (ModuleError in flux-core) are handled.
 *
 * Notification can be associated to custom [[INotifierAction | action]]
 */
export class Notifier {
    static classesIcon = {
        4: 'fas fa-2x fa-exclamation-circle text-danger px-2 mt-auto mb-auto',
        3: 'fas fa-2x fa-exclamation text-warning px-2 mt-auto mb-auto',
    }
    static classesBorder = {
        4: 'border-danger',
        3: 'border-warning',
    }

    constructor() {}
    /**
     * Popup a notification with level=='Info'
     *
     * @param message content
     * @param title title
     * @param actions available actions
     */
    static notify({
        message,
        title,
        classIcon,
        timeout,
    }: {
        message?: string | Stream$<unknown, string>
        classIcon: string | Stream$<unknown, string>
        title: string
        timeout?: Observable<any>
    }) {
        Notifier.popup({ message, title, classIcon, timeout, classBorder: '' })
    }
    /**
     * Popup a notification with level=='Error'
     *
     * @param message content
     * @param title title
     * @param actions available actions
     */
    static error({ message, title }: { message: string; title: string }) {
        Notifier.popup({
            message,
            title,
            classIcon: Notifier.classesIcon[4],
            classBorder: Notifier.classesBorder[4],
        })
    }
    /**
     * Popup a notification with level=='Warning'
     *
     * @param message content
     * @param title title
     * @param actions available actions
     */
    static warning({ message, title }: { message: string; title: string }) {
        Notifier.popup({
            message,
            title,
            classIcon: Notifier.classesIcon[3],
            classBorder: Notifier.classesBorder[3],
        })
    }

    private static popup({
        message,
        title,
        classIcon,
        classBorder,
        timeout,
    }: {
        message?: string | Stream$<unknown, string>
        title: string
        classIcon: string | Stream$<unknown, string>
        classBorder: string
        timeout?: Observable<any>
    }) {
        let view: VirtualDOM = {
            class: 'm-2 p-2 my-1 bg-white rounded ' + classBorder,
            style: { border: 'solid' },
            children: [
                {
                    class: 'fas fa-times',
                    style: { float: 'right', cursor: 'pointer' },
                    onclick: (event) => {
                        event.target.parentElement.remove()
                    },
                },
                {
                    class: 'd-flex py-2 align-items-center',
                    children: [
                        { tag: 'i', class: classIcon },
                        { tag: 'span', class: 'd-block', innerText: title },
                    ],
                },
                message
                    ? { tag: 'span', class: 'd-block px-2', innerText: message }
                    : {},
                {
                    class: 'd-flex align-space-around mt-2 fv-pointer',
                },
            ],
            connectedCallback: (elem: HTMLElement$) => {
                timeout && timeout.subscribe(() => elem.remove())
            },
        }
        let div = render(view)
        document.getElementById('notifications-container').appendChild(div)
    }
}
