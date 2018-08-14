import React from 'react'
import {withRouteData, Link} from 'react-static'
import {IFolder, IImage} from '../types'
import * as _ from 'lodash';
import * as path from "path";

interface Props {
    folder: IFolder
}


class ProjectPage extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const {folder} = this.props;

        const tags = folder.md.data.tags
            .concat(folder.md.data.year)
            .sort()
            .map(tag => ([
                <Link to={`/tags/${tag}`}>
                    <small>{tag}</small>
                </Link>,
                " / "
            ]));

        const createMediaUrl = (image: IImage) => path.join(`projects`, folder.name, image.dirpath, image.filename);

        const images =
            _.chain<IImage[]>(folder.images)
                .groupBy((image: IImage) => {
                    return `/${image.dirpath}`
                })
                .value();


        const rootImages = images["/"];
        const restImages = _.omit(images, "/");

        console.log(restImages, rootImages);

        return (
            <div>
                <table>
                    <col width="50%"/>
                    <col width="10%"/>
                    <col width="30%"/>
                    <col width="10%"/>
                    <tr>
                        <span>{tags}</span>
                        <br/>
                        <span>{folder.md.data.title.toUpperCase()}</span>
                        <br/>
                        <br/>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                        </p>
                    </tr>
                    <tr>
                        {
                            (rootImages && rootImages.length > 0)
                            &&
                            <td valign="top">
                                {
                                    rootImages.map((imageData) =>
                                        <img width="100%"
                                             src={createMediaUrl(imageData)}
                                        />
                                    )
                                }
                            </td>
                        }
                        <td/>
                        {
                            (restImages)
                            &&
                            <td valign="top">
                                {
                                    Object.keys(restImages)
                                        .map((imageGroupName) => (
                                            <div>
                                                <small>{imageGroupName.slice(0, imageGroupName.length - 1)}</small>
                                                <br/>
                                                {
                                                    restImages[imageGroupName].map(imageData =>
                                                        <img src={createMediaUrl(imageData)}
                                                             width={"50px"}
                                                        />
                                                    )
                                                }
                                                <br/>
                                                <br/>
                                            </div>
                                        ))
                                }
                            </td>
                        }
                        <td/>
                    </tr>
                </table>
            </div>
        )
    }
}

export default withRouteData(ProjectPage);