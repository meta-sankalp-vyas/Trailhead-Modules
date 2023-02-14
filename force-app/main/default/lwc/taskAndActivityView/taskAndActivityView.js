import { LightningElement, track, api } from 'lwc';

export default class TaskAndActivityView extends LightningElement {
    @track name;
    @track empId;

    @api myVal = '**Hello**';
    @api formats = ['font', 'size', 'bold', 'italic', 'underline',
            'strike', 'list', 'indent', 'align', 'link',
            'image', 'clean', 'table', 'header', 'color'];
}