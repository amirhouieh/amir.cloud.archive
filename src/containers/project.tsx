import React from 'react'
import {withRouteData, Link} from 'react-static'
import {IFolder, IImage, ImageThumbUrlSrc, ImageType, IRelatedFolder, IVideo} from '../types'
import * as _ from 'lodash';

import {ImageThumbWithLink, ImageThumb} from '../components/image-thumbs';
import {
    createProjectSubUrl, createImageThumbUrlSrc1x, createImageThumbUrlSrc0x, createPdfUrl,
    createX2Url
} from "../utils";
import {PdfThumbAllPages} from "../components/pdf-thumbs";
import {MetaTags} from "../components/seo";

interface Props {
    folder: IFolder;
    relatedFolders: IRelatedFolder[]
}


const createEmbedUrl = (url: string) => {
  let parts = url.split("/");
  const id = parts.pop();
  const base = parts.join("/");
  return `https://www.youtube.com/embed/${id}?autoplay=1`;
};

class ProjectPage extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const {folder, relatedFolders} = this.props;

        const tags = folder.md.data.tags
            .concat(folder.md.data.year)
            .sort()
            .map(tag => ([
                <Link to={`/#${tag}`} key={tag}>
                    <small>{tag}</small>
                </Link>,
                " / "
            ]));


        const images =
            _.chain<IImage[]>(folder.images)
                // .filter(img => typeof img.birthtimeMs === "number")
                .groupBy((image: IImage) => {
                    return `/${image.dirpath}`
                })
                .value();

        const videos =
            _.chain<IVideo[]>(folder.videos)
                .groupBy((video: IVideo) => {
                    return `/${video.dirpath}`
                })
                .value();

        const rootImages = images["/"]? images["/"]: [];
        const htmlImages = images["/html/"]? images["/html/"]: [];
        const restImages = _.omit(images, ["/", "/html/", "/thumbnails/"]);
        const projectUrl = createProjectSubUrl(folder);

        const rootVideos = videos["/"]? videos["/"]: [];
        const restVideos = _.omit(videos, ["/"]);


        const projectImage =  htmlImages.concat(rootImages)[0];

        const renderImage =
            (width: number, samePdfSize: boolean, urlsrcCreator: (d: IImage, f: string) => ImageThumbUrlSrc) =>
                (imageData: IImage, index: number) => (
                    imageData.type === ImageType.PDF ?
                        <PdfThumbAllPages url={createPdfUrl(imageData, folder.name)}
                                          width={width}
                                          sameSize={samePdfSize}
                        />
                        :
                        <ImageThumbWithLink imageData={imageData}
                                            folderName={folder.name}
                                            width={width}
                                            urlsrc={urlsrcCreator(imageData, folder.name)}
                        />
                );

        const renderVideo = (width: number, height: number) =>
            (videoData: IVideo, index: number) => (
                <iframe key={`video-${index}`}
                        width={width}
                        height={height}
                        src={createEmbedUrl(videoData.url)}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen />
            );

        return (
            <div>
                <MetaTags title={`amir houieh / ${folder.md.data.title}`}
                          keywords={folder.md.data.tags}
                          description={folder.md.content}
                          imagePath={projectImage? createX2Url(projectImage, folder.name): null}
                          path={folder.md.data.slug}
                />
                <span>{tags}</span>
                <br/>
                <span>{folder.md.data.title.toUpperCase()}</span>
                <br/>
                <br/>
                <small>related projects: </small>
                {
                    relatedFolders.map((rp,index) =>
                        <Link to={rp.slug}><small>{rp.title}({rp.relationWeight})</small></Link>
                    )
                }
                <br/>
                <p dangerouslySetInnerHTML={{__html: folder.md.content}}/>
                {
                    (restImages)
                    &&
                    Object.keys(restImages)
                        .map((imageGroupName, index) => (
                            <span key={`ig-${index}`}>
                                <small>{imageGroupName.slice(0, imageGroupName.length - 1)}</small>
                                <span>&ensp;</span>
                                {
                                    restImages[imageGroupName].map(renderImage(40, true, createImageThumbUrlSrc0x))
                                }
                                <span>&emsp;&emsp;</span>
                            </span>
                        ))
                }
                <br/>
                {
                    (restVideos)
                    &&
                    Object.keys(restVideos)
                        .map((videoGroupName, index) => (
                            <span key={`vg-${index}`}>
                                <small>{videoGroupName.slice(0, videoGroupName.length - 1)}</small>
                                <span>&ensp;</span>
                                {
                                    restVideos[videoGroupName].map(renderVideo(120, 70))
                                }
                                <span>&emsp;&emsp;</span>
                            </span>
                        ))
                }
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                {
                    rootVideos.map(renderVideo(600, 400))
                }
                {
                    (htmlImages.length > 0) &&
                    [
                        <a href={projectUrl} target="_blank" title={projectUrl}>{projectUrl}</a>,
                        <br/>,
                        htmlImages.map((imageData, i) => (
                            <a href={projectUrl}
                               target="_blank"
                               title={projectUrl}
                               key={`hi-${i}`}
                            >
                                <ImageThumb width={"50%"}
                                            imageData={imageData}
                                            urlsrc={createImageThumbUrlSrc1x(imageData, folder.name)}
                                />
                            </a>
                        ))
                    ]
                }
                {
                    rootImages.map(renderImage("600", false, createImageThumbUrlSrc1x))
                }
            </div>
        )
    }
}

export default withRouteData(ProjectPage);
