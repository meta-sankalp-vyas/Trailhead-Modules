import { LightningElement, api } from 'lwc';

export default class StarRating extends LightningElement {
    @api rating = 0;
    @api total = 5;

    ratingTheme = 'rating-theme';
    blankTheme = 'blank-theme';

    @api ratingStarClassName = 'rating-theme';
    @api totalStarClassName = 'blank-theme'

    @api selectedStars = [];
    @api unselectedStars = [];

    connectedCallback(){
        for(let index = 0; index < this.rating; index++){
            this.selectedStars.push({id : "selected" + index});
        }
        for(let index = 0; index < (this.total - this.rating); index++){
            this.unselectedStars.push({id : "unselected" + index});
        }
    }

    renderedCallback(){
        if(this.ratingTheme !== this.ratingStarClassName || this.blankTheme !== this.totalStarClassName){
            let parentNode = this.template.querySelector('.allStars');
            if(parentNode){
                let childItems = parentNode.children;
                if(childItems){
                    for(let index = 0; index < childItems.length; index++){
                        if(index < this.rating){
                            childItems[index].classList.remove(this.ratingTheme);
                            childItems[index].classList.add(this.ratingStarClassName);
                        } else {
                            childItems[index].classList.remove(this.blankTheme);
                            childItems[index].classList.add(this.totalStarClassName);
                        }
                    }
                }
            }
        }
    }
}