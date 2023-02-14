import { LightningElement, api, wire } from 'lwc';
import getTeamById from '@salesforce/apex/TeamController.getTeamById';

export default class TeamCard extends LightningElement {
    @api teamRecord;
    @api teamId;

    @api showdescription = false;
    @api noDetailButton = false;

}