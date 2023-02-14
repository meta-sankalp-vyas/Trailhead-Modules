import { LightningElement, api } from 'lwc';

export default class PolaroidImage extends LightningElement {
    @api imagesrc;
    @api alttext;
    @api bottomtext;
}