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
          .filter(f => ( f.nameMatch || f.relationWeight > 0 ) && f.name !== folder.name)
          .map(f => ({
            title: f.title,
            slug: f.slug,
            relationWeight: f.relationWeight,
            nameMatch: f.nameMatch
          }))
          .sort((a,b) => (b.relationWeight + (b.nameMatch? 100:0)) - (a.relationWeight+ (a.nameMatch? 100:0)))
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
