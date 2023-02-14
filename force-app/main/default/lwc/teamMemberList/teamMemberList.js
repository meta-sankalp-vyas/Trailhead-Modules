import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import TEAM_MEMBER_ADDED_MESSAGE from '@salesforce/messageChannel/TeamMemberAdded__c'
import DomElementUtility from 'c/domElementUtility';
import searchTeamMembersOfATeam from '@salesforce/apex/TeamMemberController.searchTeamMembersOfATeam';
import { refreshApex } from '@salesforce/apex';

export default class TeamMemberList extends LightningElement {
    @api teamId;
    @api dontShowDetail;

    @api addMember;
    @api recordId;
    @api teamMember;
    @api listenToEventOfTeamMemberView = false;;

    @track teamMembers;
    searchTerm = '';

    loading = false;
    @api error;
    @api noRecordsFound;
    errorMessage = 'An error occurred while loading the Team Member records'

    TEAM_MEMBER_LIST_COMPONENT_LIST_CONTAINER = '.list-members';
    TEAM_MEMBER_LIST_COMPONENT_SELECTED_MEMBER = 'member-selected';
    TEAM_MEMBER_LIST_COMPONENT_NOT_SELECTED_MEMBER = 'member-not-selected';

    wiredActivities;

    @wire(MessageContext)
    messageContext;

    connectedCallback(){
        this.listenToEventOfTeamMemberView = true;
        this.loading = true;
        this.addMember = true;
        if(this.listenToEventOfTeamMemberView){
            this.subscription = subscribe(
                this.messageContext,
                TEAM_MEMBER_ADDED_MESSAGE,
                (message) => {
                    //this.teamMembers.push(message.teamMember);
                    refreshApex(this.wiredActivities).then(() => {
                        this.recordId = message.teamMember.id;
                        this.addMember = false;
                        this.addRemoveCssPropertyOfSelected();
                        refreshApex(this.template.querySelector('c-team-member-view').wiredActivities);
                    }).catch((error) => {
                        this.error = this.errorMessage;
                    });
                });
        }
    }

    
    disconnectedCallback() {
        // Unsubscribe from TeamMemberAdded__c message
        if(this.listenToEventOfTeamMemberView){
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

    @wire(searchTeamMembersOfATeam , {searchTerm: '$searchTerm', teamId:'$teamId'} )
    wiredTeamMembers(value){
        // Hold on to the provisioned value so we can refresh it later.
        this.wiredActivities = value;
        const { data, error } = value;
        if(data){
            this.teamMembers = data;
            this.error = undefined;
            this.errorMessage = 'An error occurred while loading the Team Member records'
            this.noRecordsFound = false;
            if(this.teamMembers.length == 0){
                this.errorMessage = 'Hmmm... No Team Member exist in this Team, with this Name.'
                this.error = this.errorMessage;
                this.noRecordsFound = true;
            }
        }
        else if (error) {
            this.error = error;
            this.errorMessage = error;
            this.teamMembers = undefined;
        }
        if(this.teamMembers || this.error){
            this.loading = false;
        }
    }

    handleSearchTermChange(event){
        // Debouncing this method: do not update the reactive property as
		// long as this function is being called within a delay of 300 ms.
		// This is to avoid a very large number of Apex method calls.
		window.clearTimeout(this.delayTimeout);
		const searchTerm = event.target.value;
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.delayTimeout = setTimeout(() => {
			this.searchTerm = searchTerm;
		}, 300);
    }

    showDetails(event){
        this.recordId = event.target.dataset.set;
        this.addMember = false;
        this.addRemoveCssPropertyOfSelected();
    }

    addTeamMember(event){
        this.recordId = '';
        this.addMember = true;
        this.addRemoveCssPropertyOfSelected();
    }

    addRemoveCssPropertyOfSelected(){
        let listOfMembersContainer = this.template.querySelector(this.TEAM_MEMBER_LIST_COMPONENT_LIST_CONTAINER);

        if(listOfMembersContainer && listOfMembersContainer.childNodes){
            let allMembersInDom = listOfMembersContainer.childNodes;
            allMembersInDom.forEach(memberElement=>{
                if(memberElement && memberElement.dataset && memberElement.dataset.set == this.recordId){
                    DomElementUtility.addOrRemoveClassFromANode(memberElement, this.TEAM_MEMBER_LIST_COMPONENT_SELECTED_MEMBER, DomElementUtility.ADD_ACTION);
                    DomElementUtility.addOrRemoveClassFromANode(memberElement, this.TEAM_MEMBER_LIST_COMPONENT_NOT_SELECTED_MEMBER, DomElementUtility.REMOVE_ACTION);
                } else{
                    DomElementUtility.addOrRemoveClassFromANode(memberElement, this.TEAM_MEMBER_LIST_COMPONENT_SELECTED_MEMBER, DomElementUtility.REMOVE_ACTION);
                    DomElementUtility.addOrRemoveClassFromANode(memberElement, this.TEAM_MEMBER_LIST_COMPONENT_NOT_SELECTED_MEMBER, DomElementUtility.ADD_ACTION);
                }
            })
        }

    }
}