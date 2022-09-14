
const runTimeDependencies = {
    "load": {
        "@youwol/flux-view": "^1.0.3",
        "lodash": "^4.17.15",
        "@youwol/cdn-client": "^1.0.2",
        "@youwol/flux-core": "^0.2.1",
        "rxjs": "^6.5.5"
    },
    "differed": {},
    "includedInBundle": []
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
export const setup = {
    name:'@youwol/flux-runner',
        assetId:'QHlvdXdvbC9mbHV4LXJ1bm5lcg==',
    version:'0.1.0',
    shortDescription:"Flux runner application",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/flux-runner',
    npmPackage:'https://www.npmjs.com/package/@youwol/flux-runner',
    sourceGithub:'https://github.com/youwol/flux-runner',
    userGuide:'https://l.youwol.com/doc/@youwol/flux-runner',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    }
}
