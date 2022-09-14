require('./style.css')
import { setup } from '../auto-generated'
import { install, LoadingScreenView } from '@youwol/cdn-client'
export {}

const loadingScreen = new LoadingScreenView({
    container: document.body,
})
loadingScreen.render()
// this variable will be used in the on-load.ts to continue displaying dependencies fetching
window['fluRunnerLoadingScreen'] = loadingScreen

await install({
    modules: Object.entries(setup.runTimeDependencies.load).map(
        ([k, v]) => `${k}#${v}`,
    ),
    css: [
        'bootstrap#4.4.1~bootstrap.min.css',
        'fontawesome#5.12.1~css/all.min.css',
        '@youwol/fv-widgets#0.0.3~dist/assets/styles/style.youwol.css',
    ],
    onEvent: (event) => {
        loadingScreen.next(event)
    },
})

await import('./on-load')
