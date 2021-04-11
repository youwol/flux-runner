
// Following import is to include style.css in the dist directory (using MiniCssExtractPlugin)
// (index.html is handled by HtmlWebpackPlugin)

import { fetchBundles, fetchStyleSheets } from '@youwol/cdn-client';
export{}

require('./style.css');

await fetchStyleSheets([
    "bootstrap#4.4.1~bootstrap.min.css",
    "fontawesome#5.12.1~css/all.min.css",
    "@youwol/fv-widgets#0.0.3~dist/assets/styles/style.youwol.css"
])

await fetchBundles({
    'lodash': '4.17.15',
    "grapes": '0.16.2',
    "@youwol/flux-core": '0.0.6',
    '@youwol/flux-view': '0.0.6',
    "rxjs": '6.5.5',
    },
    window
)

await import('./on-load')

