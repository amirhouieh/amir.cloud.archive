import axios from 'axios'
import path from 'path'
import {readFileSync} from 'fs'
import _ from 'lodash'

export default {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  getSiteData: async () => {
    const siteData = JSON.parse(await readFileSync('data/site-data.json').toString('utf8'));
    return {
        ...siteData,
        path: "",
    }
  },
  getRoutes: async () => {
    const data = JSON.parse(readFileSync('data/database.min.json').toString('utf8'));
    const thumbs = _.chain(data)
        .map(folder=>
            folder.images
                .filter(img => img.isResponsive && img.dirpath === "")
                .map(img => path.join(folder.name, img.filename.replace("-0x","-2x")))
        )
        .flatten()
        .value();

    const siteThumb = thumbs[~~(Math.random() * thumbs.length)];

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
          siteThumb
        }),
        children: data.map(folder => ({
          path: `/${folder.md.data.slug}`,
          component: 'src/containers/project',
          getData: () => ({
            folder,
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
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
