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
                this.experience.world.setOpenessParameters();
                this.showOpenessMode()
                break
            case 'scenario':
            case 'building':
                const tags = this.experience.multiThumbSlider.queryModesToTags[queryMode];
                this.experience.multiThumbSlider.tags = tags;
                this.experience.multiThumbSlider.tagsToHtml(tags);
                this.experience.world.setQueryParameters(tags);
                break
        }
    }

    showOpenessMode() {
        this.defaultSLiders.style.display = "none"
        this.openessSLiders.style.display = "flex"
    }

    hideOpenessMode() {
        this.defaultSLiders.style.display = "flex"
        this.openessSLiders.style.display = "none"
   }
}