
// Adapted into vanilla CSS/JavaScript from React/TypeScript in article
// https://newsakmi.com/news/tech-news/software/lets-make-a-multi-thumb-slider-that-calculates-the-width-between-thumbs
export default class MultiThumbSlider {
    constructor() {
        this.queryModesToTags = {
            'scenario': [
                { name: 'Water', color: '#9EBFDE', value: 25 },
                { name: 'Tree', color: '#9DB97F', value: 25 },
                { name: 'Building', color: '#d3d3d3', value: 25 },
                { name: 'Sky', color: '#bce0df', value: 25 },
            ],
            'openess': [
                { name: 'Openness', color: '#505050', value: 34 },
                { name: 'Greeness', color: '#7b8f1e', value: 33 },
                { name: 'Walkability', color: '#8f6b1e', value: 33 },
            ],
            'building': [
                { name: 'Apple', color: '#8f1e5b', value: 25 },
                { name: 'Melon', color: '#1e8f89', value: 25 },
                { name: 'Guava', color: '#bcb833', value: 25 },
                { name: 'Pear', color: '#d7e2a7', value: 25 },
            ]
        }
        this.tags = this.queryModesToTags['scenario'];
        this.sliderElement = document.querySelector('.slider');

        window.addEventListener('DOMContentLoaded', (event) => {
            this.tagsToHtml(this.tags);
        });

    }

    onSliderSelect(event, sliderThumb) {
        console.log(this.tags);
        document.body.style.cursor = 'ew-resize';

        let tagIndex = parseInt(sliderThumb.parentNode.getAttribute('data-tag-index'));
        let tag = this.tags[tagIndex];
        let startDragX = event.pageX;
        let sliderWidth = this.sliderElement.offsetWidth;
        let values = this.tags.map((tag) => tag.value); // initial values

        // The onResize and onEventUp listeners are specific to each
        // onSliderSelect event hence created inside
        let onResize = (event) => {
            event.preventDefault();

            let endDragX = event.touches ? event.touches[0].pageX : event.pageX;
            let distanceMoved = endDragX - startDragX;

            values = this.tags.map((tag) => tag.value); // read in updated values
            let maxValue = values[tagIndex] + values[tagIndex + 1];
            let valueMoved = this.nearestMultiple(1, this.getPercent(sliderWidth, distanceMoved));
            let prevValue = values[tagIndex];
            let newValue = prevValue + valueMoved;

            let currTagValue = this.clamp(newValue, 0, maxValue);
            values[tagIndex] = currTagValue;

            let nextTagIndex = tagIndex + 1;
            let nextTagNewValue = values[nextTagIndex] - valueMoved;
            let nextTagValue = this.clamp(nextTagNewValue, 0, maxValue);
            values[nextTagIndex] = nextTagValue;

            // Update slider
            Array.from(document.querySelectorAll('.tag')).forEach((tagElement) => {
                let tagIndex = parseInt(tagElement.getAttribute('data-tag-index'));
                let value = values[tagIndex];

                tagElement.style.width = value + '%';
                tagElement.querySelector('.tag-value').innerHTML = value + '%';
            });
        };

        let removeEventListener = () => {
            window.removeEventListener('pointermove', onResize);
            window.removeEventListener('touchmove', onResize);

            // Update values only when user stops moving slider thumb
            this.tags.forEach((tag, tagIndex) => {
                tag.value = values[tagIndex];
            });

            this.emitEvent();
        };
        let onEventUp = (event) => {
            event.preventDefault();
            document.body.style.cursor = 'initial';
            // Send new query values to World
            experience.world.setQueryParameters(this.tags);
            console.log(this.tags);
            removeEventListener();
        };

        window.addEventListener('pointermove', onResize);
        window.addEventListener('touchmove', onResize);
        window.addEventListener("touchend", onEventUp);
        window.addEventListener("pointerup", onEventUp);
    };
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    emitEvent() {
        this.sliderElement.dispatchEvent(new CustomEvent('demo.slider.this.tags', {
            bubbles: false,
            detail: {
                tags: this.tags,
            }
        }));
    }
    getPercent(containerWidth, distanceMoved) {
        return (distanceMoved / containerWidth) * 100;
    }
    nearestMultiple(divisor, number) {
        return Math.ceil(number / divisor) * divisor;
    }
    tagsToHtml(tags) {
        let html = '';

        tags.forEach((tag, index) => {
            // Using pointerdown instead of mousedown to capture both mouse and touchscreen
            // events. See
            // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onpointerdown
            // for more info.
            html += `
            <div class="tag" data-tag-index="${index}"
              style="background:${tag.color}; width:${tag.value}%;">
              <div class="tag-container">
                <span class="tag-text tag-name">${tag.name}</span>
                <span class="tag-text tag-value">${tag.value}%</span>
              </div>
              <div class="slider-thumb"
                onpointerdown="experience.multiThumbSlider.onSliderSelect(event, this);"><span>⬌</span></div>
            </div>
        `;
        });

        document.querySelector('.slider').innerHTML = html;
    }
}