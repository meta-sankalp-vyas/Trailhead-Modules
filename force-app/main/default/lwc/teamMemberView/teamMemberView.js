import { LightningElement, api, wire, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import TEAM_MEMBER_ADDED_MESSAGE from '@salesforce/messageChannel/TeamMemberAdded__c';
import TEAM_MANAGEMENT from '@salesforce/resourceUrl/Team_Management';
import getTeamMemberById from '@salesforce/apex/TeamMemberController.getTeamMemberById';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import TEAM_MEMBER_OBJECT from '@salesforce/schema/Team_Member__c';
import NAME_FIELD from '@salesforce/schema/Team_Member__c.Name';
import SKILLS_FIELD from '@salesforce/schema/Team_Member__c.Skills__c';
import EMP_ID_FIELD from '@salesforce/schema/Team_Member__c.Employee_Id__c';
import TEAM_FIELD from '@salesforce/schema/Team_Member__c.Team__c';

export default class TeamMemberView extends LightningElement {
    @api recordId; // Team Member Id
    @api teamMember; // Team Member
    @api create = false;
    @api fetchAddUpdateEvent = false;
    @api teamId;

    @track name;
    @track empId;

    @api wiredActivities;

    @track skillBadges = [];
    teamMemberResource = {
		profile_avatar: `${TEAM_MANAGEMENT}/Images/Team_Member_Default.jpg`,
    };
    error;
    errorMessage = 'An error occurred while loading the Team Member record';
    @api loading;

    @wire(MessageContext) messageContext;

    @wire(getTeamMemberById , {teamMemberId:'$recordId'} )
    wiredTeamMember(value){
        // Hold on to the provisioned value so we can refresh it later.
        this.wiredActivities = value;
        const { data, error } = value;
        if(data){
            this.teamMember = data;
            this.skillBadges = data.Skills__c.split(';');
            if(this.teamMember.Image_Name__c){
                let profileURL = `${TEAM_MANAGEMENT}/Images/` + this.teamMember.Image_Name__c;
                if(profileURL !== this.teamMemberResource.profile_avatar){
                    this.teamMemberResource.profile_avatar = profileURL;
                }
            }
            this.error = undefined;
        }
        else if (error) {
            this.error = error;
            this.errorMessage = error;
            this.teamMember = undefined;
        }
        if(this.teamMember || this.error || this.create){
            this.loading = false;
        }
    }

    connectedCallback(){
        this.loading = true;
        if(this.create == true){
            this.teamMember = {Name: '', Skills__c: '', Employee_Id__c: '', Team__c: ''};
        }
    }

    genericOnChange(event){
        this[event.target.name] = event.target.value;
    }

    handleCreateTeamMember() {
        let recordCreated = false;
        let selectedSkills = this.template.querySelector("c-multiselect-component").getSelectedValues();
        this.teamMember.Skills__c = selectedSkills.join(';');
        this.teamMember.Name = this.name;
        this.teamMember.Employee_Id__c = this.empId;
        if(!this.recordId && this.teamId && this.create && this.teamMember){
            const recordInput = {
                apiName: TEAM_MEMBER_OBJECT.objectApiName,
                fields: {
                    [NAME_FIELD.fieldApiName] : this.teamMember.Name,
                    [SKILLS_FIELD.fieldApiName] : this.teamMember.Skills__c,
                    [EMP_ID_FIELD.fieldApiName] : this.teamMember.Employee_Id__c,
                    [TEAM_FIELD.fieldApiName] : this.teamId,
                }
            };
            createRecord(recordInput)
                .then(teamMember => {
                    // code to execute if create operation is successful
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: 'Team Member Created',
                        variant: 'success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);
                    recordCreated = true;
                    if(recordCreated){
                        if(this.fetchAddUpdateEvent){
                            const message = {
                                teamMember: teamMember
                                };
                                publish(this.messageContext, TEAM_MEMBER_ADDED_MESSAGE, message)
                        }
                    }
                })
                .catch(error => {
                    // code to execute if create operation is not successful
                    if(!recordCreated){
                        const event = new ShowToastEvent({
                            title: 'Error',
                            message: 'Unable to create Team Member',
                            variant: 'error',
                            mode: 'dismissable'
                        });
                        this.dispatchEvent(event);
                    }
                });
        }
    }
}