import React from "react";
import path from 'path'
import {readFileSync} from 'fs'
import _ from 'lodash';

export default {
    siteRoot: `https://archive.amir.cloud`,
    entry: path.join(__dirname, 'src', 'index.tsx'),
    getSiteData: async () => {
        const siteData = JSON.parse(await readFileSync('data/site-data.json').toString('utf8'));
        return {
            siteData,
            path: "",
        }
    },
    getRoutes: async () => {
        const data = JSON.parse(readFileSync('data/database.min.json').toString('utf8'));
        const thumbs = _.chain(data)
            .map(folder =>
                folder.images
                    .filter(img => img.isResponsive && img.dirpath === "")
                    .map(img => path.join(folder.name, img.filename.replace("-0x", "-2x")))
            )
            .flatten()
            .value();

        const calcRelationWeight = (one, two) => {
            return two.reduce((a, b) => {
                return a + (one.indexOf(b) > -1 ? 1 : 0)
            }, 0)
        };

        const getRelatedFolders = (folder) => {
            return data
                .map(f => ({
                    title: f.md.data.title,
                    slug: f.md.data.slug,
                    tag: f.md.data.tags,
                    name: f.name,
                    relationWeight: calcRelationWeight(folder.md.data.tags, f.md.data.tags),
                    nameMatch: f.name.slice(0, 7) === folder.name.slice(0, 7),
                }))
                .filter(f => (f.nameMatch || f.relationWeight > 0) && f.name !== folder.name)
                .map(f => ({
                    title: f.title,
                    slug: f.slug,
                    relationWeight: f.relationWeight,
                    nameMatch: f.nameMatch
                }))
                .sort((a, b) => (b.relationWeight + (b.nameMatch ? 100 : 0)) - (a.relationWeight + (a.nameMatch ? 100 : 0)))
            // .sort((a,b) => b.relationWeight - a.relationWeight);

        };


        const indexData = data
            .map(folder => ({
                thumbs: folder.thumbs,
                data: {
                    ...folder.md.data,
                    tags: [folder.md.data.year, ...folder.md.data.tags],
                },
            }))
            .sort((a, b) =>
                parseInt(b.data.year) - parseInt(a.data.year)
            );

        return [
            {
                path: '/',
                component: 'src/containers/home',
                getData: () => ({
                    projects: indexData,
                    siteThumb: "/site-thumb.png"
                }),
                children: data.map(folder => ({
                    path: `/${folder.md.data.slug}`,
                    component: 'src/containers/project',
                    getData: () => ({
                        folder,
                        relatedFolders: getRelatedFolders(folder)
                    }),
                })),
            },
            {
                is404: true,
                component: 'src/containers/404',
            },
        ]
    },


    Document: class CustomHtml extends React.Component {
        render() {
            const {
                Html, Head, Body, children, renderMeta,
            } = this.props;

            return (
                <Html lang={"en"} prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
                <Head>
                    <meta charSet="UTF-8"/>
                    <meta httpEquiv="content-type" content="text/html; charset=utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <meta name="resource-type" content="document"/>
                    <meta name="distribution" content="Global"/>
                    <meta name="rating" content="General"/>

                    <link rel="apple-touch-icon" sizes="57x57" href="https://amir.cloud/favicon/apple-icon-57x57.png"/>
                    <link rel="apple-touch-icon" sizes="60x60" href="https://amir.cloud/favicon/apple-icon-60x60.png"/>
                    <link rel="apple-touch-icon" sizes="72x72" href="https://amir.cloud/favicon/apple-icon-72x72.png"/>
                    <link rel="apple-touch-icon" sizes="76x76" href="https://amir.cloud/favicon/apple-icon-76x76.png"/>
                    <link rel="apple-touch-icon" sizes="114x114" href="https://amir.cloud/favicon/apple-icon-114x114.png"/>
                    <link rel="apple-touch-icon" sizes="120x120" href="https://amir.cloud/favicon/apple-icon-120x120.png"/>
                    <link rel="apple-touch-icon" sizes="144x144" href="https://amir.cloud/favicon/apple-icon-144x144.png"/>
                    <link rel="apple-touch-icon" sizes="152x152" href="https://amir.cloud/favicon/apple-icon-152x152.png"/>
                    <link rel="apple-touch-icon" sizes="180x180" href="https://amir.cloud/favicon/apple-icon-180x180.png"/>
                    <link rel="icon" type="image/png" sizes="192x192" href="https://amir.cloud/favicon/android-icon-192x192.png"/>
                    <link rel="icon" type="image/png" sizes="32x32" href="https://amir.cloud/favicon/favicon-32x32.png"/>
                    <link rel="icon" type="image/png" sizes="96x96" href="https://amir.cloud/favicon/favicon-96x96.png"/>
                    <link rel="icon" type="image/png" sizes="16x16" href="https://amir.cloud/favicon/favicon-16x16.png"/>
                    <link rel="manifest" href="https://amir.cloud/favicon/manifest.json"/>
                    <meta name="msapplication-TileColor" content="#ffffff"/>
                    <meta name="msapplication-TileImage" content="https://amir.cloud/favicon/ms-icon-144x144.png"/>
                    <meta name="theme-color" content="#ffffff"/>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-129679487-3" />
                    <script dangerouslySetInnerHTML={{
                        __html: `window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'UA-129679487-3');`
                    }}/>

                    {renderMeta.styleTags}
                </Head>
                <Body>
                {children}
                </Body>
                </Html>
            )
        }
    },

    webpack: (config, {defaultLoaders}) => {
        // Add .ts and .tsx extension to resolver
        config.resolve.extensions.push('.ts', '.tsx')

        // Add TypeScript Path Mappings (from tsconfig via webpack.config.js)
        // to react-statics alias resolution
        // config.resolve.alias = typescriptWebpackPaths.resolve.alias

        // We replace the existing JS rule with one, that allows us to use
        // both TypeScript and JavaScript interchangeably
        config.module.rules = [
            {
                oneOf: [
                    {
                        test: /\.(js|jsx|ts|tsx)$/,
                        exclude: defaultLoaders.jsLoader.exclude, // as std jsLoader exclude
                        use: [
                            {
                                loader: 'babel-loader',
                            },
                            {
                                loader: require.resolve('ts-loader'),
                                options: {
                                    transpileOnly: true,
                                },
                            },
                        ],
                    },
                    defaultLoaders.cssLoader,
                    defaultLoaders.fileLoader,
                ],
            },
        ]
        return config
    },
}
