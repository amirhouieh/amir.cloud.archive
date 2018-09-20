///<reference path="../../node_modules/@types/react/index.d.ts"/>
///<reference path="../../node_modules/@types/react-router/index.d.ts"/>
import React from 'react'
import {withRouteData} from 'react-static'
import {IImage, IMarkdownFrontmatter} from "../types";
import {Link} from "react-router-dom";
import * as _ from 'lodash';
import {textNodesUnder} from "../utils";
import {RouteComponentProps, withRouter} from "react-router";
import {PdfThumbAllPages} from "../components/pdf-thumbs";
import {MetaTags} from "../components/seo";

interface IProject {
    data: IMarkdownFrontmatter;
    thumbs: string[];
}

interface Iprops {
    projects: IProject[];
    siteThumb: string;
}

interface IState {
    searchQuery: String,
    filteredTags: String[],
    highlight: {
        project: IProject|null;
        tag: string|null;
    }
}

class Home extends React.Component<Iprops&RouteComponentProps<any>, IState> {
    private contentNode: HTMLElement;

    constructor(props: Iprops&RouteComponentProps<any>) {
        super(props);
        this.state = {
            searchQuery: "",
            filteredTags: [],
            highlight: {
                project: null,
                tag: null
            }
        };
    }

    toggleTagFilter = (tag: string) => {
        const {filteredTags} = this.state;
        const isSet = filteredTags.includes(tag);

        if (isSet) {
            this.setState({
                searchQuery: "",
                filteredTags: filteredTags.filter(t => t !== tag)
            })
        } else {
            this.setState({
                searchQuery: "",
                filteredTags: [...filteredTags, tag]
            })
        }
    };

    private highlightProject(project: IProject) {
        this.setState({
            ...this.state,
            highlight: {
                ...this.state.highlight,
                project
            },
        })
    }

    private unhighlightProject() {
        this.setState({
            ...this.state,
            highlight: {
                ...this.state.highlight,
                project: null
            },
        })
    }

    componentDidMount(){
        this.textNodes = textNodesUnder(this.contentNode);
        const { history: {location: {hash} } } = this.props;
        if(hash && hash.length>0){
            const tag = decodeURI(hash).replace("#", "");
            this.setState({
                filteredTags: [tag]
            })
        }
    }

    onSearch = (text: string = "") => {
        this.setState({
            searchQuery: text.toString().toLowerCase(),
            filteredTags: []
        });
        // this.highlightTags(text);
    };

    filterByTags = (project: IProject,) => {
        const {filteredTags} = this.state;
        return _.difference(filteredTags, project.data.tags).length === 0;
    };

    render() {
        const {projects, siteThumb} = this.props;
        const {filteredTags, highlight, searchQuery=""} = this.state;
        const trimedSearchQuery = searchQuery.trim();

        const tags = _.chain(projects)
            .map(p => p.data.tags.map(t => t.trim()))
            .flatten()
            .uniq()
            .filter(t => t.length > 0)
            .sort()
            .value();

        const sortedAndFilteredProjects = projects.filter(this.filterByTags);

        return (
            <div ref={c => this.contentNode = c}>
                <MetaTags imageUrl={siteThumb}
                          keywords={tags}
                />
                <input onChange={(e) => this.onSearch(e.target.value)}
                       placeholder={"search ..."}
                       type="search"
                       value={searchQuery}
                />
                <br/>
                {
                    tags.map(tag => ([
                        <a href={`javascript:;`}
                           key={`tag-${tag}`}
                        >
                            <small onClick={() => this.toggleTagFilter(tag)}>
                                {
                                    filteredTags.length > 0 ?
                                        filteredTags.includes(tag)?
                                            tag : <del>{tag}</del>
                                        :
                                        tag.indexOf(trimedSearchQuery) > -1 ?
                                            tag : <del>{tag}</del>
                                }
                            </small>
                        </a>,
                        " / "
                    ]))
                }
                <br/><br/><br/>
                {
                    sortedAndFilteredProjects
                        .map((project, i) => (
                            [
                                <Link to={`/${project.data.slug}`}
                                      onMouseEnter={() => this.highlightProject(project)}
                                      onMouseLeave={() => this.unhighlightProject()}
                                      key={`title-${i}-${project.data.slug}`}
                                >
                                    {
                                        project.data.title.toUpperCase()
                                    }
                                </Link>,
                                //<a href="/">
                                  //  <small>
                                    //    {project.data.tags.join(", ")}
                                    //</small>
                                //</a>,
                                " . "
                            ]
                        ))
                }
                <br/>
                {
                    sortedAndFilteredProjects
                        .map((project, i) => {
                            const highlighted =
                                highlight.project !== null
                                && highlight.project.data.index === project.data.index;

                            const title = `${project.data.title}(${project.data.year})`;

                            return (
                                <Link to={`/${project.data.slug}`}
                                      onMouseEnter={() => this.highlightProject(project)}
                                      onMouseLeave={() => this.unhighlightProject()}
                                      title={title}
                                      key={`image-${i}-${project.data.slug}`}
                                >
                                    {
                                        project.thumbs
                                            .filter(src => !src.endsWith("gif"))
                                            .map((src,i) => ([
                                                <img src={src.replace("public/", "")}
                                                     style={{filter: `grayscale(${highlighted ? 0 : 100}%)`}}
                                                     width={`30`}
                                                     alt={title}
                                                     title={title}
                                                     key={`img-${i}`}
                                                />,
                                                ""
                                            ]))
                                    }
                                </Link>
                            )
                        })
                }

            </div>
        )
    }
}


export default withRouteData(withRouter(Home));