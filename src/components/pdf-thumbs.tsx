import React from "react";
import {ThumbProps} from "../types";
import PDFJS from "pdfjs-dist";
import {join} from "path";


interface IProps {
    width: number;
    sameSize?: boolean;
    url: string;
}

interface IState{
    numPages: number
}

export class PdfThumbAllPages extends React.Component<IProps, IState>{
    canvases: HTMLCanvasElement[];

    constructor(props: ThumbProps & IProps){
        super(props);
        this.state = {
            numPages: 0
        }
    }

    componentDidMount(){
        const {width, url, sameSize=false} = this.props;

        if(process.env.NODE_ENV !== "development"){
            PDFJS.GlobalWorkerOptions.workerSrc = "/"
        }

        PDFJS.getDocument(url).then(pdf => {
            this.setState({ numPages: pdf.numPages }, ()=>{
                const { canvases } = this;
                canvases.forEach(async (canvas, index) => {
                    try{
                        const page = await pdf.getPage(index+1);
                        const originalViewPort = page.getViewport(1);
                        const w = sameSize ? width : (index===0)? width: width/2;
                        const viewport = page.getViewport(w/originalViewPort.width);
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };

                        page.render(renderContext).then(()=>{
                            console.log("page is rendered")
                        })
                    }catch (err){
                        console.log("error getting page");
                        console.log(err);
                    }
                });
            });
        });
    }

    render(){
        const {url} = this.props;
        const {numPages} = this.state;
        this.canvases = [];
        const baseUrl = process.env.NODE_ENV === "dev"? "http://localhost:3000": "../";
        return (
            <a href={join(baseUrl, url)} target={"_blank"}>
                {
                    new Array(numPages).fill(null).map((_, index) =>
                        <canvas
                            key={`canvas-${index}`}
                            ref={c => {
                                this.canvases.push(c);
                            }}
                        />
                    )
                }
            </a>
        )
    }
}

