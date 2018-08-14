import React from "react";
import {ThumbProps, IImage} from "../types";
import PDFJS from 'pdfjs-dist';
import {createPdfUrl} from "../utils";
import {Link} from "react-static";



interface IProps {
    width: number
}

export class PdfThumb extends React.PureComponent<ThumbProps & IProps>{
    canvas: HTMLCanvasElement;

    componentDidMount(){
        const {width, imageData, folderName} = this.props;
        const { canvas } = this;
        const url = createPdfUrl(imageData, folderName);

        PDFJS.getDocument(url).then(pdf => {
            const randomPageNumber = ~~(Math.random()*pdf.numPages) + 1;
            pdf.getPage(randomPageNumber).then((page)=>{
                const originalViewPort = page.getViewport(1);
                const viewport = page.getViewport(width/originalViewPort.width);
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).then(()=>{
                    console.log("page is rendered")
                })
            }).catch(err=>{
                console.log("error getting page");
                console.log(err);
            })
        });
    }

    render(){
        const {imageData, folderName} = this.props;
        const url = createPdfUrl(imageData, folderName);

        return (
            <a href={url} target={"_blank"}>
                <canvas
                    ref={c => {
                        this.canvas = c;
                    }}
                />
            </a>
        )
    }
}

