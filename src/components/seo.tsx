import * as React from "react";
import {Head, withSiteData} from "react-static";

interface IProps {
    title: string;
    keywords: string[];
    description: string;
    baseUrl: string;
    path: string;
    imageUrl: string;
    baseKeywords: string[];
}

const MetaTagsComponent: React.SFC<IProps> = (props) => {
    const {title, keywords, description, path, baseUrl, imageUrl, baseKeywords} = props;
    const url = `${baseUrl}${path}`;
    const image = `${baseUrl}${imageUrl}`;
    const tags = baseKeywords.concat(keywords);

    return (
        <Head>
            <meta name={`keywords`} content={tags.join()}/>
            <meta
                name={`description`}
                content={`${description}`}
            />
            <meta name={`copyright`} content={`amir.cloud`}/>
            <meta name={`language`} content={`EN`}/>
            <meta name={`Classification`} content={`Design/Programming`}/>
            <meta name={`author`} content={`Amir, amir.houieh@gmail.com`}/>
            <meta name={`designer`} content={`amir houieh`}/>
            <meta name={`owner`} content={`amir houieh`}/>
            <meta name={`url`} content={`${url}`}/>
            <meta name={`identifier-URL`} content={`${url}`}/>
            <meta name={`og:title`} content={`${title}`}/>
            <meta name={`og:url`} content={`${url}`}/>
            <meta name={`og:image`} content={`${image}`}/>
            <meta name={`og:site_name`} content={`amir houieh`}/>
            <meta name={`og:description`} content={`${description}`} />
            <title>{title}</title>

            <link
                rel="icon"
                type={`image/`}
                href={``}
            />

            <script type="application/ld+json">{`
              {
                "@context": "https://json-ld.org/contexts/person.jsonld",
                "name": "Amir Houieh",
                "born": "1940-10-09",
                "url": "amir.houieh",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "availableLanguage": ["English"]
                },
                  "sameAs": [
                  "https://www.linkedin.com/in/amirhouieh",
                  "https://github.com/amirhouieh",
                  "https://vimeo.com/user13046302",
                  "https://twitter.com/amirhouieh"
                ]
              }
        `}</script>
        </Head>
    );
};

export const MetaTags = withSiteData(MetaTagsComponent);
