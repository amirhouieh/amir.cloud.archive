import {IFolder, IImage, ImageThumbUrlSrc} from "./types";
import * as path from "path";

export const textNodesUnder = (el) => {
    let n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
    while(n=walk.nextNode()) a.push(n);
    return a;
};


export const highlightText = (node) => {
    const del = document.createElement("del");

    if (document.createRange) {
        const range = document.createRange();
        range.selectNode(node);
        range.surroundContents(del);
    }
    else {
        const range = document.body.createTextRange();
        range.moveToElementText (node);
        range.select();
        range.surroundContents(del);
    }
};


export const createPdfUrl = (image: IImage, folderName: string) =>
    path.join(
        `projects`,
        folderName,
        image.dirpath,
        image.filename
    );

export const createX0Url = (image: IImage, folderName: string) =>
    path.join(
        `projects`,
        folderName,
        image.dirpath,
        image.filename
    );

export const createX1Url = (image: IImage, folderName: string) =>
    path.join(
        `projects`,
        folderName,
        image.dirpath,
        image.filename.replace(`0x${image.ext}`, `1x${image.ext}`)
    );

export const createX2Url = (image: IImage, folderName: string) =>
    path.join(
        `projects`,
        folderName,
        image.dirpath,
        image.filename.replace(`0x${image.ext}`, `2x${image.ext}`)
    );


export const createImageThumbUrlSrc1x = (imageData: IImage, folderName: string): ImageThumbUrlSrc => {
    let url, src;
    if (imageData.isResponsive) {
        url = createX2Url(imageData, folderName);
        src = createX1Url(imageData, folderName);
    } else {
        src = url = createX0Url(imageData, folderName);
    }

    return {url, src};
};

export const createImageThumbUrlSrc0x = (imageData: IImage, folderName: string): ImageThumbUrlSrc => {
    let url, src;
    if (imageData.isResponsive) {
        url = createX2Url(imageData, folderName);
        src = createX0Url(imageData, folderName);
    } else {
        src = url = createX0Url(imageData, folderName);
    }

    return {url, src};
};

export const createProjectSubUrl = (folder: IFolder) => {
    return `https://${folder.md.data.slug.split("_").join("-")}.amir.cloud`;
};
