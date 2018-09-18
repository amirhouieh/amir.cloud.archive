import React, {HTMLProps} from "react";
import * as path from "path";

import {ThumbProps} from "../types";
import {Link} from "react-static";


export const ImageThumb: React.SFC<ThumbProps & HTMLProps<HTMLImageElement>> =
    ({
         imageData,
         width,
         urlsrc
     }) => {
        return (
            <img
                // id={imageData.birthtimeMs.toString()}
                src={`../${urlsrc.src}`}
                alt={path.basename(imageData.filename, imageData.ext)}
                title={imageData.birthtime !== null ? imageData.birthtime : ""}
                width={width}
            />
        )
    };


export const ImageThumbWithLink: React.SFC<ThumbProps & HTMLProps<HTMLImageElement>> =
    (props) => {
        return (
            <Link to={props.urlsrc.url} target={"_blank"}>
                <ImageThumb {...props}/>
            </Link>
        )
    };
