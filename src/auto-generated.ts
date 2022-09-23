
const runTimeDependencies = {
    "externals": {
        "@youwol/flux-view": "^1.0.3",
        "lodash": "^4.17.15",
        "@youwol/cdn-client": "^1.0.2",
        "@youwol/flux-core": "^0.2.1",
        "rxjs": "^6.5.5"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/flux-view": "window['@youwol/flux-view_APIv1']",
    "lodash": "window['__APIv4']",
    "@youwol/cdn-client": "window['@youwol/cdn-client_APIv1']",
    "@youwol/flux-core": "window['@youwol/flux-core_APIv02']",
    "rxjs": "window['rxjs_APIv6']",
    "rxjs/operators": "window['rxjs_APIv6']['operators']"
}
const exportedSymbols = {
    "@youwol/flux-view": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/flux-view"
    },
    "lodash": {
        "apiKey": "4",
        "exportedSymbol": "_"
    },
    "@youwol/cdn-client": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/cdn-client"
    },
    "@youwol/flux-core": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/flux-core"
    },
    "rxjs": {
        "apiKey": "6",
        "exportedSymbol": "rxjs"
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const mainEntry : Object = {
    "entryFile": "index.html",
    "loadDependencies": [
        "@youwol/flux-view",
        "lodash",
        "@youwol/cdn-client",
        "@youwol/flux-core",
        "rxjs"
    ]
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const secondaryEntries : Object = {}
const entries = {
     '@youwol/flux-runner': 'index.html',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/flux-runner/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/flux-runner',
        assetId:'QHlvdXdvbC9mbHV4LXJ1bm5lcg==',
    version:'0.1.1',
    shortDescription:"Flux runner application",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/flux-runner',
    npmPackage:'https://www.npmjs.com/package/@youwol/flux-runner',
    sourceGithub:'https://github.com/youwol/flux-runner',
    userGuide:'https://l.youwol.com/doc/@youwol/flux-runner',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{cdnClient, installParameters?}) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry['loadDependencies'].map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/flux-runner_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{name: string, cdnClient, installParameters?}) => {
        const entry = secondaryEntries[name]
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/flux-runner#0.1.1~dist/@youwol/flux-runner/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/flux-runner/${entry.name}_APIv01`]
        })
    }
}
