
export enum ImageType {
    GIF = "GIF",
    PDF = "PDF",
    OTHER = "OTHER"
}

export interface IFileEntity {
    birthtime: string | null;
    birthtimeMs: number | null;
}

export interface IImage extends IFileEntity{
    ext: string;
    type: ImageType;
    filename: string;
    isResponsive: boolean;
    dirpath: string;
}

export interface IVideo {
    url: string;
    dirpath: string;
}

export interface IMarkdownFrontmatter {
    index?: number;
    slug?: string;
    title?: string;
    text?: string;
    year?: string;
    tags?: string[];
}

export interface IMarkdown {
    data: IMarkdownFrontmatter;
    content: string;
    excrept?: string;
    language: string;
    matter: string;
}

export interface IFolder {
    name: string;
    md: IMarkdown;
    images: IImage[];
    videos: IVideo[];
    thumbs: string[];
}

export interface IRawMetadata {
    dev: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    blksize: number;
    ino: number;
    size: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: string;
}

export interface IRawBasicData {
    filename: string;
    dirname: string;
    metadata: IRawMetadata;
}

export interface ThumbProps {
    imageData: IImage,
    folderName: string,
    urlsrc?: ImageThumbUrlSrc;
}


export interface ImageThumbUrlSrc {
    url: string;
    src: string;
}


export interface IRelatedFolder {
    title: string;
    slug: string;
    relationWeight: number;
    nameMatch: Boolean;
}

export interface ISiteData {
    description: string;
    description_seo: string;
    baseKeywords: string;
    title: string;
    baseUrl: string;
    siteThumb: string;
}
