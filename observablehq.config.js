// See https://observablehq.com/framework/config for documentation.
export default {
    title: "Data Dashboard",
    pages: [
        {
            name: "Vaccine refusal",
            pages: [
                {
                    name: "About",
                    path: "/vaccine-refusal/about",
                },
                {
                    name: "Dashboard",
                    path: "/vaccine-refusal/dashboard",
                },
                {
                    name: "Data",
                    path: "/vaccine-refusal/data",
                },
                // {
                //     name: "Analysis",
                //     path: "/vaccine-refusal/analysis",
                // },
            ],
        },
        // {
        //     name: "Another section",
        //     pages: [
        //         {
        //             name: "Dashboard",
        //             path: "/section-2/dashboard",
        //         },
        //         {
        //             name: "Data",
        //             path: "/section-2/data",
        //         },
        //         {
        //             name: "Analysis",
        //             path: "/section-2/analysis",
        //         },
        //     ],
        // },
    ],
    // Content to add to the head of the page, e.g. for a favicon:
    head: '<link rel="icon" href="/assets/bansal-lab-logo.png" type="image/png" sizes="32x32">',
    // header: "<div>Foo</div>",
    // The path to the source root.
    root: "src",

    // Some additional configuration options and their defaults:
    // theme: ["near-midnight", "air"], // should defer to user's preferred color scheme
    // header: "", // what to show in the header (HTML)
    // footer: "Built with Observable.", // what to show in the footer (HTML)
    // sidebar: true, // whether to show the sidebar
    // toc: true, // whether to show the table of contents
    pager: false, // whether to show previous & next links in the footer
    // output: "dist", // path to the output root for build
    search: true, // activate search
    style: "/styles/style.css",
    dynamicPaths: [
        "/assets/fonts/roboto-v47-latin-300.woff2",
        "/assets/fonts/roboto-v47-latin-regular.woff2",
        "/assets/fonts/roboto-v47-latin-italic.woff2",
        "/assets/fonts/roboto-v47-latin-700.woff2",
    ],
    // linkify: true, // convert URLs in Markdown to links
    // typographer: false, // smart quotes and other typographic improvements
    // preserveExtension: false, // drop .html from URLs
    // preserveIndex: false, // drop /index from URLs
};
