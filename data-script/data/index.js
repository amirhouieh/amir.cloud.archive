"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob-promise");
const fs_1 = require("fs");
const matter = require("gray-matter");
const path = require("path");
const _ = require("lodash");
const child_process_promise_1 = require("child-process-promise");
const sequential = require('promise-sequential');
const weblocParse = require("webloc-parser");
const types_1 = require("../src/types");
const convertCMD = (from, to) => `convert -density 100 -resize 50x "${from}" "${to}-%0d.jpg"`;
const convertThumbCMD = (from, to) => `convert -thumbnail 30x -colors 8 -quality 90 -depth 8 -flatten "${from}" "${to}.png"`;
const imageExtensions = [".png", ".gif", ".jpeg", ".jpg", ".pdf"];
const projectsDir = "public/projects";
const getImageType = (ext) => {
    switch (ext) {
        case ".gif":
            return types_1.ImageType.GIF;
        case ".pdf":
            return types_1.ImageType.PDF;
        default:
            return types_1.ImageType.OTHER;
    }
};
const generateThumbsForImages = (destFolder, files) => __awaiter(this, void 0, void 0, function* () {
    const dir = path.join(destFolder, "thumbnails");
    yield child_process_promise_1.exec(`rm -rf ${dir} && mkdir ${dir}`);
    return sequential(files.map(file => () => __awaiter(this, void 0, void 0, function* () {
        const from = path.join(destFolder, file.dirpath, file.filename);
        const to = `${dir}/${file.birthtimeMs ? file.birthtimeMs : path.basename(file.filename, file.ext)}`;
        if (file.type !== types_1.ImageType.GIF) {
            const cmd = convertThumbCMD(from, to);
            // const cmd = convertCMD(from, to);
            return yield child_process_promise_1.exec(cmd).then(() => {
                console.log(from);
                console.log(to);
                console.log("");
            });
        }
    })));
});
const getImagesFromFolder = (folderpath, folderName) => __awaiter(this, void 0, void 0, function* () {
    const dataPath = path.join(folderpath, "data.json");
    const filesDataRaw = fs_1.readFileSync(dataPath).toString("utf8");
    let filesData = JSON.parse(filesDataRaw);
    filesData = filesData
        .filter(d => d)
        .map(d => (Object.assign({}, d, { dirname: `${d.dirname}/${path.basename(d.filename, path.extname(d.filename))}` })));
    const files = yield glob.promise(`${folderpath}/**/*.*`);
    return _.chain(files)
        .filter((filepath) => {
        const ext = path.extname(filepath).toLowerCase();
        const basename = path.basename(filepath, ext);
        return (imageExtensions.indexOf(ext) > -1
            &&
                !basename.endsWith("1x")
            &&
                !basename.endsWith("2x"));
    })
        .map((imagePath) => {
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
        const data = filesData.find(file => what.indexOf(file.dirname) > -1);
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
        };
    })
        .filter(img => !img.dirpath.startsWith("_"))
        .value();
});
const getVideosFromFolder = (folderpath, folderName) => __awaiter(this, void 0, void 0, function* () {
    const files = yield glob.promise(`${folderpath}/**/*.webloc`);
    return Promise.all(files.map((videoPath) => __awaiter(this, void 0, void 0, function* () {
        const relPath = videoPath.replace(`${folderpath}/`, "");
        const relativePath = videoPath.replace(`${projectsDir}/${folderName}/`, "");
        const url = yield weblocParse.getUrlFromFile(videoPath);
        console.log(videoPath);
        console.log(url);
        return {
            dirpath: relPath.replace(path.basename(relativePath), ""),
            url
        };
    })));
});
const getMarkdownForFolder = (folderpath) => __awaiter(this, void 0, void 0, function* () {
    const mdPath = path.join(folderpath, "index.md");
    const mdRaw = fs_1.readFileSync(mdPath).toString("utf8");
    const md = matter(mdRaw);
    return {
        data: md.data,
        content: md.content,
        excrept: md.excrept,
        language: md.language,
        matter: md.matter,
    };
});
(() => __awaiter(this, void 0, void 0, function* () {
    const projectsFolders = fs_1.readdirSync(projectsDir).filter(f => !f.startsWith("."));
    // const dir = await glob.promise(`${rootDir}/**/*`);
    const data = yield sequential(projectsFolders
        .map((folderName) => () => __awaiter(this, void 0, void 0, function* () {
        const folderPath = path.join(projectsDir, folderName);
        const images = yield getImagesFromFolder(folderPath, folderName);
        const videos = yield getVideosFromFolder(folderPath, folderName);
        const markdown = yield getMarkdownForFolder(folderPath);
        //generate thumbnails
        // await generateThumbsForImages(folderPath, images);
        const thumbs = yield glob.promise(`${folderPath}/thumbnails/*.png`);
        const gifsThumbs = images.filter(img => img.type === types_1.ImageType.GIF).map(img => path.join(folderPath, img.dirpath, img.filename));
        return {
            name: folderName,
            md: markdown,
            images: images,
            videos: videos,
            thumbs: [...thumbs, ...gifsThumbs]
        };
    })));
    fs_1.writeFileSync(`data/database.json`, JSON.stringify(data, null, 2));
    fs_1.writeFileSync(`data/database.min.json`, JSON.stringify(data));
}))();
