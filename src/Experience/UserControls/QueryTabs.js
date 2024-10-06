import Experience from "../Experience";

export default class QueryTabs {
    constructor() { }

    openQuery(evt, queryMode) {
        this.experience = new Experience();
        var tablinks;
        tablinks = document.getElementsByClassName("tabButton");

        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" tabButton--active", " tabButton--inactive");
        }
        const tags = this.experience.multiThumbSlider.queryModesToTags[queryMode];
        this.experience.multiThumbSlider.tags = tags;
        this.experience.multiThumbSlider.tagsToHtml(tags);
        evt.currentTarget.className = evt.currentTarget.className.replace(" tabButton--inactive", " tabButton--active");
    }
}