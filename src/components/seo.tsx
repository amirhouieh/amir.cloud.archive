import * as React from "react";
import {Head, withSiteData} from "react-static";
import {ISiteData} from "../types";

interface IProps {
    siteData: ISiteData
    title?: string;
    keywords?: string;
    description?: string;
    path?: string;
    imagePath?: string;
}

const MetaTagsComponent: React.SFC<IProps> = (props) => {
    const {
        siteData,
        path = "",
        ...custom
    } = props;

    const imageUrl = custom.imagePath? `${siteData.baseUrl}/${custom.imagePath}` : `${siteData.baseUrl}/${siteData.siteThumb}`;
    const url = `${siteData.baseUrl}${path}`;
    const tags = custom.keywords ? custom.keywords : siteData.baseKeywords;
    const description = custom.description? custom.description : siteData.description_seo;
    const title = custom.title? custom.title : siteData.title;

    return (
        <Head>
            <title>{title}</title>
            <meta name={`keywords`} content={tags}/>
            <meta name={`description`} content={`${description}`} />
            <meta name={`copyright`} content={`amir.cloud`}/>
            <meta name={`language`} content={`EN`}/>
            <meta name={`Classification`} content={`Design/Programming`}/>
            <meta name={`author`} content={`Amir, amir.houieh@gmail.com`}/>
            <meta name={`designer`} content={`amir houieh`}/>
            <meta name={`owner`} content={`amir houieh`}/>
            <meta name={`url`} content={`${url}`}/>
            <meta name={`identifier-URL`} content={`${url}`}/>
            <meta property={`og:title`} content={`${title}`}/>
            <meta property={`og:url`} content={`${url}`}/>
            <meta property={`og:image`} content={`${imageUrl}`}/>
            <meta property={`og:site_name`} content={`amir houieh`}/>
            <meta property={`og:description`} content={`${description}`} />
            <meta name="twitter:image" content={imageUrl} />

            <link rel="shortcut icon"
                  type="image/x-icon"
                  href={`favicon/android-icon-192x192.png`}
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
