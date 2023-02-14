import { LightningElement, api, wire } from 'lwc';
import TEAM_MANAGEMENT from '@salesforce/resourceUrl/Team_Management';
import getTeamById from '@salesforce/apex/TeamController.getTeamById';

export default class TeamView extends LightningElement {
    @api teamRecord;
    @api teamId;

    @api error;
    errorMessage = 'Unable to find Team with the provided Team Id.'

    loading = false;
    showTeamCardDescription = true;
    noTeamCardDetailButton = true;

    teamMemberResource = {
		team_avatar: `${TEAM_MANAGEMENT}/Images/Team_Default.jpg`,
    };

    connectedCallback(){
        this.loading = true;
        this.error = 'Fetching Data...'
    }

    @wire(getTeamById, {teamId : '$teamId'})
    wiredTeamRecord({data, error}){
        if(data){
            this.teamRecord = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
        } else {
            if(this.teamId){
                this.error = this.errorMessage;
            }
        }
    }
}