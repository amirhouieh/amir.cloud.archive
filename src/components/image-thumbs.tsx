import React, {HTMLProps} from "react";
import * as path from "path";

import {ThumbProps} from "../types";


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
        const baseUrl = process.env.NODE_ENV === "dev"? "http://localhost:3000": "https://archive.amir.cloud";

        return (
            <a href={path.join(baseUrl, props.urlsrc.url)} target={"_blank"}>
                <ImageThumb {...props}/>
            </a>
        )
    };
