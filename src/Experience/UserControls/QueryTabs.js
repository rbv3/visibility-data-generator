import Experience from "../Experience";

export default class QueryTabs {
    constructor() {
        this.openessSLiders = document.querySelector('.queryOpenessSliders');
        this.defaultSLiders = document.querySelector('.querySliders');

    }

    openQuery(evt, queryMode) {
        this.hideOpenessMode();
        this.experience = new Experience();
        var tablinks;
        tablinks = document.getElementsByClassName("tabButton");

        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" tabButton--active", " tabButton--inactive");
        }
        evt.currentTarget.className = evt.currentTarget.className.replace(" tabButton--inactive", " tabButton--active");


        switch (queryMode) {
            case 'openess':
                this.showOpenessMode()
                break
            case 'scenario':
            case 'building':
                const tags = this.experience.multiThumbSlider.queryModesToTags[queryMode];
                this.experience.multiThumbSlider.tags = tags;
                this.experience.multiThumbSlider.tagsToHtml(tags);
                break
        }
    }

    showOpenessMode() {
        this.defaultSLiders.style.display = "none"
        this.openessSLiders.hidden = false
    }

    hideOpenessMode() {
        this.defaultSLiders.style.display = "flex"
        this.openessSLiders.hidden = true
   }
}