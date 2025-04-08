// See https://observablehq.com/framework/config for documentation.
export default {
    title: "Data Dashboard",
    pages: [
        {
            name: "Vaccine refusal",
            pages: [
                {
                    name: "Dashboard",
                    path: "/vaccine_refusal/vacc-refusal",
                },
                {
                    name: "Data",
                    path: "/vaccine_refusal/data",
                },
                {
                    name: "Analysis",
                    path: "/vaccine_refusal/analysis",
                },
            ],
        },
        {
            name: "Another section",
            pages: [
                {
                    name: "Dashboard",
                    path: "/section_2/dashboard",
                },
                {
                    name: "Data",
                    path: "/section_2/data",
                },
                {
                    name: "Analysis",
                    path: "/section_2/analysis",
                },
            ],
        },
    ],
    // Content to add to the head of the page, e.g. for a favicon:
    head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',
    // The path to the source root.
    root: "src",

    // Some additional configuration options and their defaults:
    // theme: "default", // try "light", "dark", "slate", etc.
    // header: "", // what to show in the header (HTML)
    // footer: "Built with Observable.", // what to show in the footer (HTML)
    // sidebar: true, // whether to show the sidebar
    // toc: true, // whether to show the table of contents
    // pager: true, // whether to show previous & next links in the footer
    // output: "dist", // path to the output root for build
    // search: true, // activate search
    // linkify: true, // convert URLs in Markdown to links
    // typographer: false, // smart quotes and other typographic improvements
    // preserveExtension: false, // drop .html from URLs
    // preserveIndex: false, // drop /index from URLs
};
