import * as glob from 'glob-promise';
import {readdirSync, readFileSync, writeFileSync} from "fs";
import * as matter from 'gray-matter';
import * as path from "path";
import * as _ from "lodash";
import {exec} from 'child-process-promise';
const sequential = require('promise-sequential');
import * as weblocParse from 'webloc-parser';

import {IFolder, IImage, ImageType, IMarkdown, IRawBasicData, IVideo} from "../src/types";


const convertCMD = (from: string, to: string) =>
    `convert -density 100 -resize 50x "${from}" "${to}-%0d.jpg"`;

const convertThumbCMD = (from: string, to: string) =>
    `convert -thumbnail 30x -colors 8 -quality 90 -depth 8 -flatten "${from}" "${to}.png"`;

const imageExtensions = [".png", ".gif", ".jpeg", ".jpg", ".pdf"];
const projectsDir = "public/projects";

const getImageType = (ext: string): ImageType => {
    switch (ext) {
        case ".gif":
            return ImageType.GIF;
        case ".pdf":
            return ImageType.PDF;
        default:
            return ImageType.OTHER;
    }
};


const generateThumbsForImages = async (destFolder: string, files: IImage[]) => {
    const dir = path.join(destFolder, "thumbnails");
    await exec(`rm -rf ${dir} && mkdir ${dir}`);
    return sequential(
        files.map(file => async () => {
            const from = path.join(destFolder, file.dirpath, file.filename);
            const to = `${dir}/${file.birthtimeMs? file.birthtimeMs : path.basename(file.filename, file.ext)}`;
            if(file.type !== ImageType.GIF){
                const cmd = convertThumbCMD(from, to);
                // const cmd = convertCMD(from, to);
                return await exec(cmd).then(()=>{
                    console.log(from);
                    console.log(to);
                    console.log("");
                })
            }
        })
    );
};


const getImagesFromFolder = async (folderpath: string, folderName: string): Promise<IImage[]> => {
    const dataPath = path.join(folderpath, "data.json");
    const filesDataRaw = readFileSync(dataPath).toString("utf8");
    let filesData: IRawBasicData[] = JSON.parse(filesDataRaw);

    filesData = filesData
        .filter(d => d)
        .map(d => ({
            ...d,
            dirname: `${d.dirname}/${path.basename(d.filename, path.extname(d.filename))}`
        }));

    const files = await glob.promise(`${folderpath}/**/*.*`);

    return _.chain(files)
        .filter((filepath: string) => {
            const ext = path.extname(filepath).toLowerCase();
            const basename = path.basename(filepath, ext);
            return (
                imageExtensions.indexOf(ext) > -1
                &&
                !basename.endsWith("1x")
                &&
                !basename.endsWith("2x")
            );
        })
        .map((imagePath: string): IImage => {
            const relPath = imagePath.replace(`${folderpath}/`, "");
            const ext = path.extname(imagePath).toLowerCase();
            const basename = path.basename(imagePath, ext);
            const isResponsive = basename.endsWith("0x");
            const type = getImageType(ext);

            const dirpath = relPath.split(path.sep).slice(0, -1).join(path.sep);

            const what = isResponsive ?
                `${dirpath}/${basename}`.slice(0, -3)
                :
                `${dirpath}/${basename}`;

            const data = filesData.find(file =>
                what.indexOf(file.dirname) > -1
            );

            const relativePath = imagePath.replace(`${projectsDir}/${folderName}/`, "");
            const filename = path.basename(imagePath);

            return {
                type: type,
                ext: ext,
                isResponsive,
                filename,
                dirpath: relPath.replace(path.basename(relativePath), ""),
                birthtime: data ? data.metadata.birthtime : null,
                birthtimeMs: data ? data.metadata.birthtimeMs : null
            }
        })
        .filter(img => !img.dirpath.startsWith("_"))
        .value();
};

const getVideosFromFolder = async (folderpath: string, folderName: string): Promise<IVideo[]> => {
    const files = await glob.promise(`${folderpath}/**/*.webloc`);

    return Promise.all(
        files.map(async (videoPath: string): Promise<IVideo> => {
            const relPath = videoPath.replace(`${folderpath}/`, "");
            const relativePath = videoPath.replace(`${projectsDir}/${folderName}/`, "");
            const url = await weblocParse.getUrlFromFile(videoPath);
            console.log(videoPath);
            console.log(url);
            return {
                dirpath: relPath.replace(path.basename(relativePath), ""),
                url
            }
        })
    )
};

const getMarkdownForFolder = async (folderpath: string): Promise<IMarkdown> => {
    const mdPath = path.join(folderpath, "index.md");
    const mdRaw = readFileSync(mdPath).toString("utf8");
    const md = matter(mdRaw);

    return {
        data: md.data,
        content: md.content,
        excrept: md.excrept,
        language: md.language,
        matter: md.matter,
    }
};


(async () => {
    const projectsFolders = readdirSync(projectsDir).filter(f => !f.startsWith("."));
    // const dir = await glob.promise(`${rootDir}/**/*`);

    const data: IFolder[] = await sequential(
        projectsFolders
            .map((folderName) => async() => {
                const folderPath = path.join(projectsDir, folderName);
                const images = await getImagesFromFolder(folderPath, folderName);
                const videos = await getVideosFromFolder(folderPath, folderName);
                const markdown = await getMarkdownForFolder(folderPath);

                //generate thumbnails
                // await generateThumbsForImages(folderPath, images);
                const thumbs = await glob.promise(`${folderPath}/thumbnails/*.png`);
                const gifsThumbs = images.filter(img => img.type === ImageType.GIF).map(img=>
                    path.join(folderPath, img.dirpath, img.filename)
                );

                return {
                    name: folderName,
                    md: markdown,
                    images: images,
                    videos: videos,
                    thumbs: [...thumbs, ...gifsThumbs]
                }

            })
    );

    writeFileSync(`data/database.json`, JSON.stringify(data, null, 2));
    writeFileSync(`data/database.min.json`, JSON.stringify(data));
})();